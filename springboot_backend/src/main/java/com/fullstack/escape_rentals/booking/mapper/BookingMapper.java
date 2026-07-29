package com.fullstack.escape_rentals.booking.mapper;

import com.fullstack.escape_rentals.booking.dto.request.CreateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.request.UpdateBookingRequest;
import com.fullstack.escape_rentals.booking.dto.response.BookingResponse;
import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BookingMapper {
    public BookingEntity toEntity(
            CreateBookingRequest request,
            PropertyEntity property,
            UserEntity guest,
            BigDecimal totalPrice,
            BookingStatus status
    ) {
        return BookingEntity.builder()
                .property(property)
                .guest(guest)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guestCount(request.getGuestCount())
                .totalPrice(totalPrice)
                .status(status)
                .build();
    }

    public BookingResponse toResponse(BookingEntity booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .propertyId(
                        booking.getProperty() != null
                                ? booking.getProperty().getId()
                                : null
                )
                .propertyTitle(
                        booking.getProperty() != null
                                ? booking.getProperty().getTitle()
                                : "N/A"
                )
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .guestCount(booking.getGuestCount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .guestId(
                        booking.getGuest() != null
                                ? booking.getGuest().getId()
                                : null
                )
                .guestName(
                        booking.getGuest() != null
                                ? booking.getGuest().getFirstName()
                                  + " "
                                  + booking.getGuest().getLastName()
                                : null
                )
                .guestEmail(
                        booking.getGuest() != null
                                ? booking.getGuest().getEmail()
                                : null
                )
                .guestPhone(
                        booking.getGuest() != null
                                ? booking.getGuest().getPhone()
                                : null
                )
                .build();
    }


    public void updateEntity(BookingEntity booking, UpdateBookingRequest request) {

        if (request == null) return;

        if (request.getCheckInDate() != null) {
            booking.setCheckInDate(request.getCheckInDate());
        }

        if (request.getCheckOutDate() != null) {
            booking.setCheckOutDate(request.getCheckOutDate());
        }

        if (request.getGuestCount() != null) {
            booking.setGuestCount(request.getGuestCount());
        }
    }
}
