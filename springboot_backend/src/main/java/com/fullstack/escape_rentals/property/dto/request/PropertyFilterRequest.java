package com.fullstack.escape_rentals.property.dto.request;

import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PropertyFilterRequest {

    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String city;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Size(max = 100, message = "Country name cannot exceed 100 characters")
    private String country;

    private Long categoryId;

    @Min(value = 1, message = "Must accommodate at least 1 guest")
    private Integer maxGuests;

    @Min(value = 0, message = "Bedrooms cannot be negative")
    private Integer bedrooms;

    @DecimalMin(value = "0.0", message = "Minimum price cannot be negative")
    private BigDecimal minPrice;

    @DecimalMin(value = "0.0", message = "Maximum price cannot be negative")
    private BigDecimal maxPrice;

    private LocalDate checkInDate;
    private LocalDate checkOutDate;

    private PropertyStatus status;
}
