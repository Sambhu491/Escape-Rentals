package com.fullstack.escape_rentals.booking.serviceImpl;

import com.fullstack.escape_rentals.booking.dto.request.BookingFilterRequest;
import com.fullstack.escape_rentals.booking.dto.request.CreateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.request.UpdateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.response.BookingResponse;
import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.mapper.BookingMapper;
import com.fullstack.escape_rentals.booking.pricing.BookingPricingService;
import com.fullstack.escape_rentals.booking.pricing.PriceCalculationResult;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.booking.service.BookingService;
import com.fullstack.escape_rentals.booking.specification.BookingSpecification;
import com.fullstack.escape_rentals.booking.validation.BookingValidator;
import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DisabledException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.notification.service.NotificationService;
import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import com.fullstack.escape_rentals.payment.repository.PaymentRepository;
import com.fullstack.escape_rentals.property.entity.BookingApprovalType;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {


    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingValidator bookingValidator;
    private final BookingMapper bookingMapper;
    private final BookingPricingService bookingPricingService;
    private final NotificationService notificationService;
    private final InAppNotificationService inAppNotificationService;
    private final PaymentRepository paymentRepository;

    // ---------------- CREATE BOOKING ----------------
    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, CustomUserDetails user) {

        PropertyEntity property = propertyRepository.findByIdForUpdate(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        if(user.getRole() == Role.ROLE_HOST) {
            throw new BadRequestException("Hosts cannot book property. Please create an User Account.");
        }
        if (property.getHost().getId().equals(user.getId())) {
            throw new BadRequestException("You cannot book your own property.");
        }

        UserEntity guest = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Defense-in-depth: the JWT filter already re-checks enabled status via
        // CustomUserDetailsService on every request, but that's an auth-layer
        // concern the business logic shouldn't silently depend on — a disabled
        // account should never be able to create a new booking, checked here
        // explicitly against the freshest DB state.
        if (!guest.isEnabled()) {
            throw new DisabledException("Your account has been disabled and cannot make new bookings.");
        }

        // 1. VALIDATIONS
        bookingValidator.validatePropertyStatus(property);
        bookingValidator.validateGuestCapacity(property, request.getGuestCount());
        bookingValidator.validateBookingDates(request.getCheckInDate(), request.getCheckOutDate());
        bookingValidator.validateAvailability(
                property.getId(),
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        PriceCalculationResult pricing = bookingPricingService.calculate(
                property,
                request.getCheckInDate(),
                request.getCheckOutDate()
        );

        BigDecimal totalPrice = pricing.getTotalPrice();

        // 3. STATUS BASED ON PROPERTY RULE
        BookingStatus status;
        LocalDateTime paymentDeadline = null;
        if(property.getBookingApprovalType()
                == BookingApprovalType.AUTO){
            status = BookingStatus.BOOKING_PAYMENT_PENDING;
            paymentDeadline =
                    LocalDateTime.now().plusHours(24);
        }
        else{
            status = BookingStatus.PENDING;
        }

        // 4. CREATE BOOKING
        BookingEntity booking = bookingMapper.toEntity(
                request,
                property,
                guest,
                totalPrice,
                status
        );
        booking.setPaymentDeadline(paymentDeadline);
        BookingEntity savedBooking = bookingRepository.save(booking);

        return bookingMapper.toResponse(savedBooking);
    }

    // ---------------- GET BY ID ----------------
    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId, CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        boolean isGuest = booking.getGuest() != null
                && booking.getGuest().getId().equals(currentUser.getId());

        boolean isHost = booking.getProperty() != null
                && booking.getProperty().getHost() != null
                && booking.getProperty().getHost().getId().equals(currentUser.getId());

        if (!isAdmin && !isGuest && !isHost) {
            throw new AccessDeniedException("You do not have permission to view this booking");
        }

        return bookingMapper.toResponse(booking);
    }

    // ---------------- FILTER BOOKINGS ----------------
    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookings(BookingFilterRequest filter, Pageable pageable,CustomUserDetails currentUser) {

        boolean isAdmin = currentUser.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));
        boolean isHost = currentUser.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_HOST"));

        if (!isAdmin) {
            if (isHost) {
                filter.setHostId(currentUser.getId());
                filter.setGuestId(null);
            } else {
                filter.setGuestId(currentUser.getId());
                filter.setHostId(null);
            }
        }

        Specification<BookingEntity> spec = Specification
                .where(BookingSpecification.hasUserId(filter.getGuestId()))
                .and(BookingSpecification.hasPropertyId(filter.getPropertyId()))
                .and(BookingSpecification.hasHostId(filter.getHostId()))
                .and(BookingSpecification.hasStatus(filter.getStatus()))
                .and(BookingSpecification.checkInAfter(filter.getCheckInFrom()))
                .and(BookingSpecification.checkInBefore(filter.getCheckInTo()))
                .and(BookingSpecification.checkOutAfter(filter.getCheckOutFrom()))
                .and(BookingSpecification.checkOutBefore(filter.getCheckOutTo()));

        return bookingRepository.findAll(spec, pageable)
                .map(bookingMapper::toResponse);
    }

    // ---------------- MY BOOKINGS ----------------
    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getMyBookings(Long guestId, Pageable pageable) {

        return bookingRepository.findAll(
                BookingSpecification.hasUserId(guestId),
                pageable
        ).map(bookingMapper::toResponse);
    }

    // ---------------- HOST BOOKINGS ----------------
    @Override
    @Transactional(readOnly = true)
    public Page<BookingResponse> getBookingsForHost(Long hostId, Pageable pageable) {


        UserEntity host = userRepository.findById(hostId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Host not found")
                );

        if(host.getRole() != Role.ROLE_HOST
                && host.getRole() != Role.ROLE_ADMIN){
            throw new AccessDeniedException(
                    "Only hosts can view property bookings"
            );
        }

        return bookingRepository.findAll(
                BookingSpecification.hasHostId(hostId),
                pageable
        ).map(bookingMapper::toResponse);
    }


    // ---------------- UPDATE BOOKING ----------------
    @Override
    public BookingResponse updateBooking(Long bookingId, UpdateBookingRequest request, CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        PropertyEntity property = propertyRepository.findById(booking.getProperty().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!booking.getGuest().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new AccessDeniedException("You do not have permission to modify this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be updated");
        }

        LocalDate checkIn = request.getCheckInDate() != null
                ? request.getCheckInDate()
                : booking.getCheckInDate();

        LocalDate checkOut = request.getCheckOutDate() != null
                ? request.getCheckOutDate()
                : booking.getCheckOutDate();

        Integer guestCount = request.getGuestCount() != null
                ? request.getGuestCount()
                : booking.getGuestCount();

        bookingValidator.validatePropertyStatus(property);
        bookingValidator.validateGuestCapacity(property, guestCount);
        bookingValidator.validateBookingDates(checkIn, checkOut);
        bookingValidator.validateAvailabilityForUpdate(
                booking.getId(),
                property.getId(),
                checkIn,
                checkOut
        );

        PriceCalculationResult pricing = bookingPricingService.calculate(
                property,
                checkIn,
                checkOut
        );

        bookingMapper.updateEntity(booking, request);
        booking.setProperty(property);
        booking.setTotalPrice(pricing.getTotalPrice());

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    // ---------------- CANCEL BOOKING ----------------
    @Override
    @Transactional
    public void guestCancelledBooking(Long bookingId, CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isAdmin =
                currentUser.getAuthorities()
                        .stream()
                        .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if (!booking.getGuest().getId().equals(currentUser.getId()) && !isAdmin) {
            throw new AccessDeniedException("Not allowed");
        }

        if (booking.getStatus() == BookingStatus.GUEST_CANCELLED
                ||
                booking.getStatus() == BookingStatus.HOST_CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed past booking");
        }

        // Bug fix: this previously blocked cancellation whenever checkInDate was
        // "today or earlier" (!isAfter(now)), but bookings are allowed to be created
        // with checkInDate == today (CreateBookingRequest uses @FutureOrPresent), so a
        // same-day booking became instantly uncancellable — even seconds after paying.
        // Only block once the check-in date has actually passed.
        if (booking.getCheckInDate().isBefore(LocalDate.now())) {
            throw new BadRequestException(
                    "Cannot cancel a booking after check-in date has started"
            );
        }

        booking.setStatus(BookingStatus.GUEST_CANCELLED);

        PaymentEntity payment = paymentRepository
                .findByBookingId(bookingId)
                .orElse(null);

        if(payment != null
                && payment.getStatus() == PaymentStatus.PAID){

            payment.setStatus(PaymentStatus.REFUNDED);

            paymentRepository.save(payment);
        }

        BookingEntity savedBooking = bookingRepository.save(booking);

        PropertyEntity property = savedBooking.getProperty();

        UserEntity host = property.getHost();

        notificationService.sendHostBookingCancelledByGuest(
                host.getFirstName(),
                host.getEmail(),
                property.getTitle(),
                savedBooking.getId().toString(),
                savedBooking.getGuest().getFirstName()
                        + " "
                        + savedBooking.getGuest().getLastName(),
                savedBooking.getCheckInDate().toString(),
                savedBooking.getCheckOutDate().toString()
        );

        inAppNotificationService.notify(
                host,
                NotificationType.BOOKING,
                "Booking cancelled",
                savedBooking.getGuest().getFirstName() + " cancelled their booking for \"" + property.getTitle() + "\".",
                savedBooking.getId()
        );
    }


    @Override
    @Transactional
    public BookingResponse approveBooking(Long bookingId,
                                          CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isOwner = booking.getProperty()
                .getHost()
                .getId()
                .equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException(
                    "You are not authorized to approve this booking."
            );
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending bookings can be approved."
            );
        }

        booking.setStatus(BookingStatus.BOOKING_PAYMENT_PENDING);
        booking.setPaymentDeadline(
                LocalDateTime.now()
                        .plusHours(24)
        );

        BookingEntity saved = bookingRepository.save(booking);

        notificationService.sendPaymentRequiredNotification(
                saved.getGuest().getFirstName(),
                saved.getGuest().getEmail(),
                saved.getId().toString(),
                saved.getTotalPrice()
        );

        inAppNotificationService.notify(
                saved.getGuest(),
                NotificationType.BOOKING,
                "Booking approved",
                "Your booking for \"" + saved.getProperty().getTitle() + "\" was approved — complete payment to confirm your stay.",
                saved.getId()
        );

        return bookingMapper.toResponse(saved);
    }



    @Override
    @Transactional
    public BookingResponse hostRejectedBooking(Long bookingId,
                                         CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isHost = booking.getProperty()
                .getHost()
                .getId()
                .equals(currentUser.getId());

        if (!isAdmin && !isHost) {
            throw new AccessDeniedException(
                    "You are not authorized to reject this booking."
            );
        }

        if (booking.getStatus() == BookingStatus.GUEST_CANCELLED
                ||
                booking.getStatus() == BookingStatus.HOST_CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }


        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException(
                    "Only pending bookings can be rejected."
            );
        }


        booking.setStatus(BookingStatus.HOST_CANCELLED);

        BookingEntity saved = bookingRepository.save(booking);

        notificationService.sendBookingRejection(
                saved.getGuest().getFirstName(),
                saved.getGuest().getEmail(),
                saved.getProperty().getTitle()
        );

        inAppNotificationService.notify(
                saved.getGuest(),
                NotificationType.BOOKING,
                "Booking request declined",
                "Your booking request for \"" + saved.getProperty().getTitle() + "\" was declined by the host.",
                saved.getId()
        );

        return bookingMapper.toResponse(saved);
    }

    // ---------------- HOST CANCEL (paid/confirmed bookings) ----------------
    // hostRejectedBooking only ever covered PENDING requests. Hosts had no way
    // to cancel a booking once it moved to BOOKING_PAYMENT_PENDING or CONFIRMED
    // (for either AUTO or MANUAL approval properties). This mirrors
    // guestCancelledBooking's refund behavior but is host/admin-initiated.
    @Override
    @Transactional
    public BookingResponse hostCancelBooking(Long bookingId, CustomUserDetails currentUser) {

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;
        boolean isHost = booking.getProperty()
                .getHost()
                .getId()
                .equals(currentUser.getId());

        if (!isAdmin && !isHost) {
            throw new AccessDeniedException(
                    "You are not authorized to cancel this booking."
            );
        }

        if (booking.getStatus() == BookingStatus.GUEST_CANCELLED
                || booking.getStatus() == BookingStatus.HOST_CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed past booking");
        }

        if (booking.getStatus() == BookingStatus.EXPIRED) {
            throw new BadRequestException("Booking has already expired");
        }

        booking.setStatus(BookingStatus.HOST_CANCELLED);
        booking.setPaymentDeadline(null);

        PaymentEntity payment = paymentRepository
                .findByBookingId(bookingId)
                .orElse(null);

        if (payment != null && payment.getStatus() == PaymentStatus.PAID) {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        }

        BookingEntity saved = bookingRepository.save(booking);

        notificationService.sendBookingRejection(
                saved.getGuest().getFirstName(),
                saved.getGuest().getEmail(),
                saved.getProperty().getTitle()
        );

        inAppNotificationService.notify(
                saved.getGuest(),
                NotificationType.BOOKING,
                "Booking cancelled by host",
                "Your reservation for \"" + saved.getProperty().getTitle() + "\" was cancelled by the host." +
                        (payment != null && payment.getStatus() == PaymentStatus.REFUNDED ? " Your payment has been refunded." : ""),
                saved.getId()
        );

        return bookingMapper.toResponse(saved);
    }

    // ---------------- ADMIN: CONFIRM PAYMENT (manual reconciliation) ----------------
    // Replaces the old adminConfirmBooking, which force-confirmed a PENDING
    // booking straight to CONFIRMED — silently bypassing payment entirely,
    // even for a request that hadn't been approved yet. That's gone. An admin
    // "confirming a booking" now goes through the exact same approveBooking
    // path a host uses (PENDING -> BOOKING_PAYMENT_PENDING); this method is a
    // separate, explicit action that only ever applies to a booking already
    // awaiting payment, for reconciling payments taken outside Razorpay
    // (bank transfer, cash, a dispute resolution, etc).
    @Override
    @Transactional
    public BookingResponse adminConfirmPayment(Long bookingId, CustomUserDetails currentUser) {

        if (currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only admins can manually confirm a payment.");
        }

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.BOOKING_PAYMENT_PENDING) {
            throw new BadRequestException("This booking is not awaiting payment.");
        }

        PaymentEntity payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        long amountInPaise = booking.getTotalPrice()
                .multiply(new BigDecimal(100))
                .longValueExact();

        if (payment == null) {
            // No Razorpay order was ever created for this booking — record a
            // placeholder payment so the admin ledger still has an entry for it.
            payment = PaymentEntity.builder()
                    .booking(booking)
                    .razorpayOrderId("ADMIN_MANUAL_" + booking.getId() + "_" + System.currentTimeMillis())
                    .amount(amountInPaise)
                    .currency("INR")
                    .status(PaymentStatus.PAID)
                    .build();
        } else {
            payment.setStatus(PaymentStatus.PAID);
        }
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaymentDeadline(null);
        BookingEntity saved = bookingRepository.save(booking);

        notificationService.sendBookingConfirmation(
                saved.getGuest().getFirstName(),
                saved.getGuest().getEmail(),
                saved.getId().toString()
        );

        inAppNotificationService.notify(
                saved.getGuest(),
                NotificationType.PAYMENT,
                "Payment confirmed",
                "Your payment for \"" + saved.getProperty().getTitle() + "\" was manually confirmed by our team — your booking is now confirmed.",
                saved.getId()
        );

        return bookingMapper.toResponse(saved);
    }

    // ---------------- ADMIN: REJECT PAYMENT (manual reconciliation) ----------------
    @Override
    @Transactional
    public BookingResponse adminRejectPayment(Long bookingId, CustomUserDetails currentUser) {

        if (currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new AccessDeniedException("Only admins can reject a payment.");
        }

        BookingEntity booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (booking.getStatus() != BookingStatus.BOOKING_PAYMENT_PENDING) {
            throw new BadRequestException("This booking is not awaiting payment.");
        }

        PaymentEntity payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (payment != null) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
        }

        booking.setStatus(BookingStatus.HOST_CANCELLED);
        booking.setPaymentDeadline(null);
        BookingEntity saved = bookingRepository.save(booking);

        notificationService.sendBookingRejection(
                saved.getGuest().getFirstName(),
                saved.getGuest().getEmail(),
                saved.getProperty().getTitle()
        );

        inAppNotificationService.notify(
                saved.getGuest(),
                NotificationType.PAYMENT,
                "Payment rejected",
                "Your payment for \"" + saved.getProperty().getTitle() + "\" could not be confirmed, and your booking has been cancelled.",
                saved.getId()
        );

        return bookingMapper.toResponse(saved);
    }

}
