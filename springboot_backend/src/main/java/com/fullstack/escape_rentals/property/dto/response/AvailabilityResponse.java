package com.fullstack.escape_rentals.property.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@Builder
@AllArgsConstructor
public class AvailabilityResponse {
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
}