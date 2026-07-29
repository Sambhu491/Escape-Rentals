package com.fullstack.escape_rentals.saved.service;

import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface SavedPropertyService {
    void saveProperty(Long propertyId, CustomUserDetails currentUser);

    void unsaveProperty(Long propertyId, CustomUserDetails currentUser);

    Page<PropertyResponse> getMySavedProperties(Long userId, Pageable pageable);

    List<Long> getMySavedPropertyIds(Long userId);
}
