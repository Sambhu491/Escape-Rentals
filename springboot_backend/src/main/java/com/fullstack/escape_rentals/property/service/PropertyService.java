package com.fullstack.escape_rentals.property.service;

import com.fullstack.escape_rentals.property.dto.request.CreatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.request.PropertyFilterRequest;
import com.fullstack.escape_rentals.property.dto.request.UpdatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.response.AvailabilityResponse;
import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface PropertyService {
    PropertyResponse createProperty(CreatePropertyRequest request, List<MultipartFile> images , Long hostId);

    PropertyResponse getPropertyById(Long id);

    Page<PropertyResponse> getPropertiesByFilter(
            PropertyFilterRequest filter,
            Pageable pageable
    );

    Page<PropertyResponse> getAllProperties(Pageable pageable);

    List<PropertyResponse> getPropertiesByHostId(Long currentHostId);

    PropertyResponse updateProperty(Long id, UpdatePropertyRequest request, CustomUserDetails userDetails);

    void deleteProperty(Long id,CustomUserDetails userDetails);

    Page<PropertyResponse> getAllPropertiesForAdmin(Pageable pageable);

    PropertyResponse addPropertyImages(
            Long propertyId,
            List<MultipartFile> images,
            CustomUserDetails userDetails
    );

    void deletePropertyImage(
            Long propertyId,
            Long imageId,
            CustomUserDetails userDetails
    );

    List<AvailabilityResponse> getPropertyAvailability(
            Long propertyId,
            LocalDate from,
            LocalDate to
    );

    List<String> getAvailableCities();
}













