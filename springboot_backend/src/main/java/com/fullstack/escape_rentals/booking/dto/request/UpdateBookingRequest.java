package com.fullstack.escape_rentals.booking.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateBookingRequest {
    @FutureOrPresent
    private LocalDate checkInDate;

    @Future
    private LocalDate checkOutDate;

    @Min(value = 1, message = "Guest count must be at least 1")
    private Integer guestCount;
}
