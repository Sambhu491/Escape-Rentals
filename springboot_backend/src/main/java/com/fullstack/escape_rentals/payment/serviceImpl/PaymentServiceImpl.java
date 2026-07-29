package com.fullstack.escape_rentals.payment.serviceImpl;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DisabledException;
import com.fullstack.escape_rentals.exception.InternalServerException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import com.fullstack.escape_rentals.payment.dto.request.VerifyPaymentRequest;
import com.fullstack.escape_rentals.payment.dto.response.CreateOrderResponse;
import com.fullstack.escape_rentals.payment.dto.response.PaymentResponse;
import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import com.fullstack.escape_rentals.payment.repository.PaymentRepository;
import com.fullstack.escape_rentals.payment.service.PaymentService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private static final String CURRENCY = "INR";
    private final RazorpayClient razorpayClient;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;
    private final PaymentFailureServiceImpl paymentFailureService;


    @Value("${razorpay.key-id}")
    private String keyID;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;



    private PaymentResponse toResponse(PaymentEntity payment){

        BookingEntity booking = payment.getBooking();

        return PaymentResponse.builder()
                .paymentId(payment.getId())
                .bookingId(booking.getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayPaymentId(payment.getRazorpayPaymentId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .createdAt(payment.getCreatedAt())
                .bookingStatus(booking.getStatus())
                .propertyTitle(
                        booking.getProperty() != null
                                ? booking.getProperty().getTitle()
                                : null
                )
                .guestName(
                        booking.getGuest() != null
                                ? booking.getGuest().getFirstName() + " " + booking.getGuest().getLastName()
                                : null
                )
                .guestEmail(
                        booking.getGuest() != null
                                ? booking.getGuest().getEmail()
                                : null
                )
                .hostName(
                        booking.getProperty() != null && booking.getProperty().getHost() != null
                                ? booking.getProperty().getHost().getFirstName() + " " + booking.getProperty().getHost().getLastName()
                                : null
                )
                .build();
    }

    @Override
    @Transactional
    public CreateOrderResponse createOrder(Long bookingId,CustomUserDetails currentUser){

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        boolean isOwner =
                booking.getGuest()
                        .getId()
                        .equals(currentUser.getId());


        boolean isAdmin =
                currentUser.getRole()==Role.ROLE_ADMIN;


        if(!isOwner && !isAdmin){
            throw new AccessDeniedException(
                    "You cannot pay for this booking"
            );
        }

        // Defense-in-depth: a disabled account shouldn't be able to initiate a
        // payment even if its JWT is still technically unexpired — checked
        // fresh here rather than trusted only to the auth layer.
        if (!booking.getGuest().isEnabled()) {
            throw new DisabledException("Your account has been disabled and cannot make payments.");
        }

        if(booking.getStatus()
                != BookingStatus.BOOKING_PAYMENT_PENDING){

            throw new BadRequestException(
                    "Booking is not awaiting payment"
            );
        }

        Optional<PaymentEntity> existing =
                paymentRepository.findByBookingId(bookingId);

        PaymentEntity currentPayment = existing.orElse(null);

        if (currentPayment != null) {
            if (currentPayment.getStatus() == PaymentStatus.PAID) {
                throw new BadRequestException(
                            "Booking has already been paid."
                );
            }
            if (currentPayment.getStatus() == PaymentStatus.CREATED) {
                CreateOrderResponse response = new CreateOrderResponse();
                response.setOrderId(currentPayment.getRazorpayOrderId());
                response.setAmount(currentPayment.getAmount());
                response.setCurrency(currentPayment.getCurrency());
                response.setKey(keyID);
                return response;
            }
        }


        if(booking.getPaymentDeadline() == null ||
                booking.getPaymentDeadline().isBefore(LocalDateTime.now())){
            throw new BadRequestException(
                    "Payment deadline has expired."
            );
        }

        long amountInPaise = booking.getTotalPrice()
                .multiply(new BigDecimal(100))
                .longValueExact();

        JSONObject options = new JSONObject();
        options.put("amount", amountInPaise);
        options.put("currency", CURRENCY);
        options.put("receipt", "BOOKING_" + booking.getId());

        try {
            Order order = razorpayClient.orders.create(options);

            String razorpayOrderId = order.get("id").toString();

            // Bug fix: there was no re-payment path. A signature-verification
            // failure leaves a FAILED PaymentEntity permanently attached to the
            // booking (booking_id is a unique FK, one row per booking), but this
            // method only ever handled PAID/CREATED above — anything else (i.e.
            // FAILED) fell through to inserting a brand-new row here, which
            // violates that unique constraint. Reuse the existing row instead of
            // creating a second one whenever the guest retries paying.
            PaymentEntity payment;
            if (currentPayment != null) {
                payment = currentPayment;
                payment.setRazorpayOrderId(razorpayOrderId);
                payment.setRazorpayPaymentId(null);
                payment.setRazorpaySignature(null);
                payment.setAmount(amountInPaise);
                payment.setCurrency(CURRENCY);
                payment.setStatus(PaymentStatus.CREATED);
            } else {
                payment = PaymentEntity.builder()
                        .booking(booking)
                        .razorpayOrderId(razorpayOrderId)
                        .amount(amountInPaise)
                        .currency(CURRENCY)
                        .status(PaymentStatus.CREATED)
                        .build();
            }

            paymentRepository.save(payment);

            CreateOrderResponse response = new CreateOrderResponse();
            response.setOrderId(razorpayOrderId);
            response.setAmount(amountInPaise);
            response.setCurrency(CURRENCY);
            response.setKey(keyID);

            return response;

        } catch (RazorpayException e) {
            throw new InternalServerException("Failed to create Razorpay order.", e);
        }
    }


    @Override
    @Transactional
    public void verifyPayment(VerifyPaymentRequest request,CustomUserDetails currentUser) {

        PaymentEntity payment = paymentRepository
                .findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Payment not found"));
        BookingEntity checkBooking = payment.getBooking();
        boolean isAdmin =
                currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner =
                checkBooking.getGuest()
                        .getId()
                        .equals(currentUser.getId());
        if(!isOwner && !isAdmin){

            throw new AccessDeniedException(
                    "You cannot verify this payment."
            );
        }

        if (!checkBooking.getGuest().isEnabled()) {
            throw new DisabledException("Your account has been disabled and cannot complete payments.");
        }

        if(payment.getStatus() == PaymentStatus.PAID){
                return;
        }

        JSONObject attributes = new JSONObject();
        attributes.put(
                "razorpay_order_id",
                request.getRazorpayOrderId()
        );
        attributes.put(
                "razorpay_payment_id",
                request.getRazorpayPaymentId()
        );
        attributes.put(
                "razorpay_signature",
                request.getRazorpaySignature()
        );


        try {
            boolean verified =
                    Utils.verifyPaymentSignature(
                            attributes,
                            keySecret
                    );

            if(!verified){
                paymentFailureService.markFailed(payment);
                throw new BadRequestException(
                        "Payment verification failed"
                );
            }

            BookingEntity booking = payment.getBooking();

            if(booking.getPaymentDeadline()==null ||
                    booking.getPaymentDeadline()
                            .isBefore(LocalDateTime.now())){
                throw new BadRequestException(
                        "Payment deadline has expired."
                );
            }

            if(booking.getStatus()
                    != BookingStatus.BOOKING_PAYMENT_PENDING){
                throw new BadRequestException(
                        "Booking is not awaiting payment"
                );
            }
            payment.setStatus(PaymentStatus.PAID);
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaymentDeadline(null);

            bookingRepository.save(booking);
            paymentRepository.save(payment);

            notificationService.sendPaymentConfirmation(
                    booking.getGuest().getFirstName(),
                    booking.getGuest().getEmail(),
                    payment.getRazorpayPaymentId()
            );

            notificationService.sendBookingConfirmation(
                    booking.getGuest().getFirstName(),
                    booking.getGuest().getEmail(),
                    booking.getId().toString()
            );

            inAppNotificationService.notify(
                    booking.getGuest(),
                    NotificationType.PAYMENT,
                    "Payment successful",
                    "Your payment for \"" + booking.getProperty().getTitle() + "\" was received — your booking is confirmed.",
                    booking.getId()
            );

        } catch (RazorpayException e) {

            throw new InternalServerException(
                    "Unable to verify payment",e
            );
            }
        }


    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByBooking(
            Long bookingId,
            CustomUserDetails currentUser
    ){
        PaymentEntity payment = paymentRepository
                .findByBookingId(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Payment not found"));

        BookingEntity booking = payment.getBooking();

        boolean isAdmin =
                currentUser.getRole() == Role.ROLE_ADMIN;

        boolean isGuest =
                booking.getGuest() != null
                        && booking.getGuest().getId()
                        .equals(currentUser.getId());

        boolean isHost =
                booking.getProperty() != null
                        && booking.getProperty().getHost() != null
                        && booking.getProperty().getHost().getId()
                        .equals(currentUser.getId());

        if(!isAdmin && !isGuest && !isHost){
            throw new AccessDeniedException(
                    "You are not allowed to view this payment."
            );
        }

        return toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getPayments(
            Pageable pageable
    ){

        return paymentRepository.findAll(pageable)
                .map(this::toResponse);
    }


    @Override
    @Transactional
    public void handleWebhook(
            String payload,
            String signature
    ){
        if(signature == null || signature.isBlank()){
            throw new BadRequestException("Missing webhook signature");
        }

        try {
            boolean valid = Utils.verifyWebhookSignature(
                    payload,
                    signature,
                    webhookSecret
            );
            if(!valid){
                throw new BadRequestException("Invalid webhook signature");
            }
        } catch (RazorpayException e) {
            throw new BadRequestException("Invalid webhook signature");
        }


        JSONObject event = new JSONObject(payload);
        String eventType = event.getString("event");
        if(!eventType.equals("payment.captured")){
            return;
        }
        JSONObject paymentEntity =
                event.getJSONObject("payload")
                        .getJSONObject("payment")
                        .getJSONObject("entity");
        String orderId =
                paymentEntity.getString("order_id");
        String paymentId =
                paymentEntity.getString("id");
        PaymentEntity payment =
                paymentRepository
                        .findByRazorpayOrderId(orderId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Payment not found"
                                ));
        if(payment.getStatus() == PaymentStatus.PAID){
            return;
        }
        BookingEntity booking =
                payment.getBooking();
        payment.setStatus(
                PaymentStatus.PAID
        );
        payment.setRazorpayPaymentId(
                paymentId
        );
        booking.setStatus(
                BookingStatus.CONFIRMED
        );
        booking.setPaymentDeadline(null);
        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

}

