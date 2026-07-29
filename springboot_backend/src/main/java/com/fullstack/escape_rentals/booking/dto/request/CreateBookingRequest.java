package com.fullstack.escape_rentals.booking.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateBookingRequest {

    @NotNull(message = "Property ID is mandatory")
    private Long propertyId;

    @NotNull(message = "Check-in date is mandatory")
    @FutureOrPresent(message = "Check-in date must be today or in the future")
    private LocalDate checkInDate;

    @NotNull(message = "Check-out date is mandatory")
    @Future(message = "Check-out date must be in the future")
    private LocalDate checkOutDate;

    @NotNull(message = "Guest count is mandatory")
    @Min(value = 1, message = "Guest count must be at least 1")
    private Integer guestCount;
}
