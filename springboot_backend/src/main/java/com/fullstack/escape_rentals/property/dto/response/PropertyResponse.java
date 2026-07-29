package com.fullstack.escape_rentals.property.dto.response;

import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    // BASIC INFO
    private Long id;
    private String title;
    private String description;

    // PRICING
    private BigDecimal pricePerNight;

    // LOCATION
    private String address;
    private String city;
    private String state;
    private String country;

    // CAPACITY
    private Integer maxGuests;
    private Integer bedrooms;
    private Integer bathrooms;

    // STATUS (replaces boolean available)
    private PropertyStatus status;

    // MEDIA
    private List<String> amenities;
    private List<PropertyImageResponse> images;

    // CATEGORY INFO
    private Long categoryId;
    private String categoryName;

    // HOST INFO
    private Long hostId;
    private String hostName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Double averageRating;
    private Long reviewCount;
}
