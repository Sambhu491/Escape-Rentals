package com.fullstack.escape_rentals.booking.pricing;

import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class BookingPricingService {
    public PriceCalculationResult calculate(
            PropertyEntity property,
            LocalDate checkIn,
            LocalDate checkOut
    ) {

        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);

        if (nights <= 0) {
            throw new BadRequestException("Invalid booking duration");
        }

        BigDecimal subtotal = property.getPricePerNight()
                .multiply(BigDecimal.valueOf(nights));

        return PriceCalculationResult.builder()
                .nights(nights)
                .pricePerNight(property.getPricePerNight())
                .subtotal(subtotal)
                .totalPrice(subtotal)
                .build();
    }
}
