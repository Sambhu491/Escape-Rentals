package com.fullstack.escape_rentals.property.dto.request;

import com.fullstack.escape_rentals.property.entity.BookingApprovalType;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePropertyRequest {

    @Size(max = 150, message = "Title cannot exceed 150 characters")
    private String title;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;


    @DecimalMin(value = "0.01", message = "Price must be greater than zero")
    private BigDecimal pricePerNight;

    // LOCATION
    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String country;

    // CAPACITY
    @Positive
    private Integer maxGuests;

    @Min(value = 0)
    private Integer bedrooms;

    @Min(value = 0)
    private Integer bathrooms;

    @Size(max = 20, message = "Too many amenities allowed (max 20)")
    private Set<
            @NotBlank(message = "Amenity name cannot be blank")
            @Size(max = 100, message = "Each amenity must be at most 100 characters")
                    String
            > amenities;

    @Positive(message = "Category ID must be positive")
    private Long categoryId;

    private PropertyStatus status;

    private BookingApprovalType bookingApprovalType;
}
