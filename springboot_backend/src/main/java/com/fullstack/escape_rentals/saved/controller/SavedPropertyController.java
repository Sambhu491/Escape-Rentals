package com.fullstack.escape_rentals.saved.controller;

import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.saved.service.SavedPropertyService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved-properties")
@RequiredArgsConstructor
public class SavedPropertyController {

    private final SavedPropertyService savedPropertyService;

    @PostMapping("/{propertyId}")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Void> saveProperty(@PathVariable Long propertyId,
                                              @AuthenticationPrincipal CustomUserDetails user) {
        savedPropertyService.saveProperty(propertyId, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Void> unsaveProperty(@PathVariable Long propertyId,
                                                @AuthenticationPrincipal CustomUserDetails user) {
        savedPropertyService.unsaveProperty(propertyId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Page<PropertyResponse>> getMySavedProperties(
            @AuthenticationPrincipal CustomUserDetails user,
            @PageableDefault(size = 12, sort = "createdAt") Pageable pageable) {
        return ResponseEntity.ok(savedPropertyService.getMySavedProperties(user.getId(), pageable));
    }

    @GetMapping("/ids")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<List<Long>> getMySavedPropertyIds(@AuthenticationPrincipal CustomUserDetails user) {
        return ResponseEntity.ok(savedPropertyService.getMySavedPropertyIds(user.getId()));
    }
}
