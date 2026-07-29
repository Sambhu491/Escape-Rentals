package com.fullstack.escape_rentals.booking.scheduler;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingStatusScheduler {

    private final BookingRepository bookingRepository;

    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void updateBookingStatuses() {

        LocalDate today = LocalDate.now();

        List<BookingEntity> bookings =
                bookingRepository.findByStatusAndCheckOutDateBefore(
                        BookingStatus.CONFIRMED,
                        LocalDate.now()
                );

        bookings.forEach(booking ->
                booking.setStatus(BookingStatus.COMPLETED)
        );

        if(!bookings.isEmpty()) {
            bookingRepository.saveAll(bookings);
        }

        LocalDateTime cutoff =
                LocalDateTime.now().minusHours(24);

        int expired =
                bookingRepository.expirePendingBookings(
                        cutoff,
                        BookingStatus.PENDING,
                        BookingStatus.EXPIRED
                );

        log.info(
                "{} bookings completed, {} pending bookings expired",
                bookings.size(),
                expired
        );
    }

}
