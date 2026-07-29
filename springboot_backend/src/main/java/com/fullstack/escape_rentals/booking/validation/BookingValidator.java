package com.fullstack.escape_rentals.booking.validation;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor

public class BookingValidator {
    private final BookingRepository bookingRepository;

    public void validateBookingDates(
            LocalDate checkInDate,
            LocalDate checkOutDate
    ) {

        if (!checkOutDate.isAfter(checkInDate)) {
            throw new BadRequestException(
                    "Check-out date must be after check-in date."
            );
        }
    }

    public void validateAvailability(
            Long propertyId,
            LocalDate checkInDate,
            LocalDate checkOutDate
    ) {

        boolean booked = bookingRepository.existsOverlappingBooking(
                propertyId,
                checkInDate,
                checkOutDate,
                List.of(
                        BookingStatus.PENDING,
                        BookingStatus.CONFIRMED,
                        BookingStatus.BOOKING_PAYMENT_PENDING
                )
        );

        if (booked) {
            throw new BadRequestException(
                    "Property is already booked for the selected dates."
            );
        }
    }

    public void validateAvailabilityForUpdate(
            Long bookingId,
            Long propertyId,
            LocalDate checkInDate,
            LocalDate checkOutDate
    ) {

        boolean booked = bookingRepository.existsOverlappingBookingExcept(
                bookingId,
                propertyId,
                checkInDate,
                checkOutDate,
                List.of(
                        BookingStatus.PENDING,
                        BookingStatus.CONFIRMED,
                        BookingStatus.BOOKING_PAYMENT_PENDING
                )
        );

        if (booked) {
            throw new BadRequestException(
                    "Property is already booked for the selected dates."
            );
        }
    }

    public void validateGuestCapacity(PropertyEntity property, int guests) {
        if (guests > property.getMaxGuests()) {
            throw new BadRequestException("Guest limit exceeded.");
        }
    }

    public void validatePropertyStatus(PropertyEntity property) {
        if (property.getStatus() != PropertyStatus.AVAILABLE) {
            throw new BadRequestException("Property unavailable.");
        }
    }

}
