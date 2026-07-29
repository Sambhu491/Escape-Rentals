package com.fullstack.escape_rentals.payment.scheduler;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.payment.entity.PaymentEntity;
import com.fullstack.escape_rentals.payment.entity.PaymentStatus;
import com.fullstack.escape_rentals.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentExpiryScheduler {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    @Scheduled(cron = "0 */15 * * * *")
    @Transactional
    public void expirePendingPayments(){

        List<BookingEntity> bookings =
                bookingRepository
                        .findByStatusAndPaymentDeadlineBefore(
                                BookingStatus.BOOKING_PAYMENT_PENDING,
                                LocalDateTime.now()
                        );
        for(BookingEntity booking : bookings){
            PaymentEntity payment = paymentRepository
                    .findByBookingId(booking.getId())
                    .orElse(null);

            if(payment != null
                    && payment.getStatus() == PaymentStatus.PAID){
                continue;
            }

            if(payment != null){
                if(payment.getStatus() == PaymentStatus.CREATED){
                    payment.setStatus(PaymentStatus.FAILED);
                    paymentRepository.save(payment);
                }
            }
            booking.setStatus(BookingStatus.EXPIRED);
            booking.setPaymentDeadline(null);
        }

        if (!bookings.isEmpty()) {
            bookingRepository.saveAll(bookings);
        }
        log.info(
                "Expired {} unpaid bookings",
                bookings.size()
        );
    }

}
