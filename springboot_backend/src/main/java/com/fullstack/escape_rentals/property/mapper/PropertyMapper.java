package com.fullstack.escape_rentals.property.mapper;

import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import com.fullstack.escape_rentals.image.entity.ImageEntity;
import com.fullstack.escape_rentals.property.dto.request.CreatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.request.UpdatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.response.PropertyImageResponse;
import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Component
public class PropertyMapper {

    private String buildFullName(UserEntity host) {
        String first = host.getFirstName() != null ? host.getFirstName().trim() : "";
        String last = host.getLastName() != null ? host.getLastName().trim() : "";

        String combined = (first + " " + last).trim();
        return combined.isEmpty() ? "Unknown Host" : combined;
    }

    public PropertyResponse toPropertyResponse(PropertyEntity entity) {

        if (entity == null) return null;

        return PropertyResponse.builder()

                // BASIC INFO
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())

                // PRICING
                .pricePerNight(entity.getPricePerNight())

                // LOCATION
                .address(entity.getAddress())
                .city(entity.getCity())
                .state(entity.getState())
                .country(entity.getCountry())

                // CAPACITY
                .maxGuests(entity.getMaxGuests())
                .bedrooms(entity.getBedrooms())
                .bathrooms(entity.getBathrooms())

                // STATUS
                .status(entity.getStatus())

                // COLLECTIONS (safe copy)
                .amenities(entity.getAmenities() != null
                        ? new ArrayList<>(entity.getAmenities())
                        : new ArrayList<>())

                .images(
                        entity.getImages() == null
                                ? List.of()
                                : entity.getImages()
                                  .stream()
                                  .map(image ->
                                          PropertyImageResponse.builder()
                                          .id(image.getId())
                                          .imageUrl(image.getImageUrl())
                                          .publicId(image.getPublicId())
                                          .build()
                                  )
                                  .toList()
                )

                // CATEGORY
                .categoryId(entity.getCategory() != null
                        ? entity.getCategory().getId()
                        : null)

                .categoryName(entity.getCategory() != null
                        ? entity.getCategory().getName()
                        : null)

                // HOST
                .hostId(entity.getHost() != null
                        ? entity.getHost().getId()
                        : null)

                .hostName(entity.getHost() != null
                        ? buildFullName(entity.getHost())
                        : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public PropertyEntity toPropertyEntity(CreatePropertyRequest request,
                                   UserEntity host,
                                   CategoryEntity category) {

        if (request == null) return null;

        return PropertyEntity.builder()

                .title(request.getTitle())
                .description(request.getDescription())
                .pricePerNight(request.getPricePerNight())

                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .country(request.getCountry())

                .maxGuests(request.getMaxGuests())
                .bedrooms(request.getBedrooms())
                .bathrooms(request.getBathrooms())

                .amenities(request.getAmenities() != null
                        ? new HashSet<>(request.getAmenities())
                        : new HashSet<>())
                .host(host)
                .category(category)
                .build();
    }

    public void updatePropertyEntity(PropertyEntity entity, UpdatePropertyRequest request) {

        if (request == null) return;

        if (request.getTitle() != null) entity.setTitle(request.getTitle());
        if (request.getDescription() != null) entity.setDescription(request.getDescription());
        if (request.getPricePerNight() != null) entity.setPricePerNight(request.getPricePerNight());

        if (request.getAddress() != null) entity.setAddress(request.getAddress());
        if (request.getCity() != null) entity.setCity(request.getCity());
        if (request.getState() != null) entity.setState(request.getState());
        if (request.getCountry() != null) entity.setCountry(request.getCountry());

        if (request.getMaxGuests() != null) entity.setMaxGuests(request.getMaxGuests());
        if (request.getBedrooms() != null) entity.setBedrooms(request.getBedrooms());
        if (request.getBathrooms() != null) entity.setBathrooms(request.getBathrooms());

        if (request.getAmenities() != null) {
            entity.setAmenities(new HashSet<>(request.getAmenities()));
        }
    }


}
