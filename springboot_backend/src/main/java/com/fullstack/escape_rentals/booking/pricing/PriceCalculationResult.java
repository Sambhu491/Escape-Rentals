package com.fullstack.escape_rentals.booking.pricing;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class PriceCalculationResult {
    private long nights;
    private BigDecimal pricePerNight;
    private BigDecimal subtotal;
    private BigDecimal totalPrice;
}
