package com.fullstack.escape_rentals.property.controller;

import com.fullstack.escape_rentals.property.dto.request.CreatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.request.PropertyFilterRequest;
import com.fullstack.escape_rentals.property.dto.request.UpdatePropertyRequest;
import com.fullstack.escape_rentals.property.dto.response.AvailabilityResponse;
import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.property.service.PropertyService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@Tag(name = "Property Management")
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HOST') or hasRole('ADMIN')")
    public ResponseEntity<PropertyResponse> createProperty(
            @Valid @RequestPart("property") CreatePropertyRequest request,
            @RequestPart("images") List<MultipartFile> images,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PropertyResponse response = propertyService.createProperty(request, images , userDetails.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> getPropertyById(@PathVariable Long id){
        return ResponseEntity.ok(propertyService.getPropertyById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<PropertyResponse>> getPropertiesByFilter(
            @Valid @ModelAttribute PropertyFilterRequest filter,
            @PageableDefault(size = 12,sort = "createdAt")
            Pageable pageable
            ){
        return ResponseEntity.ok(
                propertyService.getPropertiesByFilter(filter,pageable));
    }

    @GetMapping
    public ResponseEntity<Page<PropertyResponse>> getAllProperties(
            @PageableDefault(size = 12, sort = "createdAt")
            Pageable pageable
    ){
        return ResponseEntity.ok(propertyService.getAllProperties(pageable));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    public ResponseEntity<PropertyResponse> updateProperty(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePropertyRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(propertyService.updateProperty(id,request,userDetails));
    }

    @GetMapping("/my-properties")
    @PreAuthorize("hasAnyRole('HOST')")
    public ResponseEntity<List<PropertyResponse>> getPropertiesByHostId(
            @AuthenticationPrincipal CustomUserDetails userDetails){
        return ResponseEntity.ok(propertyService.getPropertiesByHostId(userDetails.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    public ResponseEntity<Void> deleteProperty(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
            ){
        propertyService.deleteProperty(id,userDetails);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/admin/get-property")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<PropertyResponse>> getAllPropertiesForAdmin(
            @PageableDefault(size = 12, sort = "createdAt")
            Pageable pageable
    ){

        return ResponseEntity.ok(
                propertyService.getAllPropertiesForAdmin(pageable)
        );
    }

    @PostMapping(value = "/{id}/images",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<PropertyResponse> addPropertyImages(
            @PathVariable Long id,
            @RequestPart("images") List<MultipartFile> images,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                propertyService.addPropertyImages(id, images, userDetails)
        );
    }

    @DeleteMapping("/{propertyId}/images/{imageId}")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<Void> deletePropertyImage(
            @PathVariable Long propertyId,
            @PathVariable Long imageId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        propertyService.deletePropertyImage(
                propertyId,
                imageId,
                userDetails
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilityResponse>> getAvailability(
            @PathVariable Long id,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {

        return ResponseEntity.ok(
                propertyService.getPropertyAvailability(
                        id,
                        from,
                        to
                )
        );
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getAvailableCities() {
        return ResponseEntity.ok(propertyService.getAvailableCities());
    }

}
