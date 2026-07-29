package com.fullstack.escape_rentals.booking.dto.request;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class BookingFilterRequest {
    private Long guestId;
    private Long propertyId;
    private Long hostId;
    private BookingStatus status;
    private LocalDate checkInFrom;
    private LocalDate checkInTo;
    private LocalDate checkOutFrom;
    private LocalDate checkOutTo;
}
