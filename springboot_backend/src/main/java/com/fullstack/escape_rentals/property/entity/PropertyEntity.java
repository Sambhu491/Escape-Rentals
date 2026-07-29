package com.fullstack.escape_rentals.property.entity;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import com.fullstack.escape_rentals.common.entity.BaseEntity;
import com.fullstack.escape_rentals.image.entity.ImageEntity;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Entity
@Table(name="properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyEntity extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    @DecimalMin(value = "0.01", message = "Price per night must be greater than zero")
    private BigDecimal pricePerNight;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false, length = 100)
    private String city;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(nullable = false, length = 100)
    private String country;

    // Capacity
    @Column(nullable = false)
    private Integer maxGuests;

    @Column(nullable = false)
    private Integer bedrooms;

    @Column(nullable = false)
    private Integer bathrooms;

    // Property status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PropertyStatus status = PropertyStatus.AVAILABLE;


    // Amenities
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "property_amenities",
            joinColumns = @JoinColumn(name = "property_id")
    )
    @Column(name = "amenity", length = 300)
    @Builder.Default
    private Set<String> amenities = new HashSet<>();

    // Image URLs
    @OneToMany(
            mappedBy = "property",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private List<ImageEntity> images = new ArrayList<>();

    // Host
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "host_id", nullable = false)
    private UserEntity host;

    // Category
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    // Booking Type
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingApprovalType bookingApprovalType = BookingApprovalType.AUTO;

    @OneToMany(
            mappedBy = "property",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<BookingEntity> bookings = new HashSet<>();


    @OneToMany(
            mappedBy = "property",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @Builder.Default
    private Set<ReviewEntity> reviews = new HashSet<>();

    @Column(nullable = false)
    @Builder.Default
    private boolean deleted = false;
}














