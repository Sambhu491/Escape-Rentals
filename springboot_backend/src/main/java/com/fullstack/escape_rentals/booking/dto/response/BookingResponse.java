package com.fullstack.escape_rentals.booking.dto.response;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class BookingResponse {
    private final Long id;
    private final Long propertyId;
    private final String propertyTitle;
    private final LocalDate checkInDate;
    private final LocalDate checkOutDate;
    private final BigDecimal totalPrice;
    private final BookingStatus status;
    private final LocalDateTime createdAt;
    private final LocalDateTime updatedAt;

    private final Long guestId;
    private final String guestName;
    private final Integer guestCount;
    private final String guestEmail;
    private final String guestPhone;
}
