package com.fullstack.escape_rentals.review.controller;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewFilterRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewResponse;
import com.fullstack.escape_rentals.review.service.ReviewService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@Tag(name = "User Review Management")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ReviewResponse> addReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(reviewService.addReview(request, user.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewResponse> getReviewById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                reviewService.getReviewById(id)
        );
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<Page<ReviewResponse>> getPropertyReviews(
            @PathVariable Long propertyId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                reviewService.getPropertyReviews(propertyId, pageable)
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','HOST')")
    public ResponseEntity<Page<ReviewResponse>> getReviews(
            @ModelAttribute ReviewFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                reviewService.getReviews(filter, pageable)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<ReviewResponse> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                reviewService.updateReview(id, request, user)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        reviewService.deleteReview(id, user);
        return ResponseEntity.noContent().build();
    }

}
















