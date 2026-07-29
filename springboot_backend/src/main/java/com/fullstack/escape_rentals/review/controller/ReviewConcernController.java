package com.fullstack.escape_rentals.review.controller;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewConcernRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewConcernFilterRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewConcernResponse;
import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import com.fullstack.escape_rentals.review.service.ReviewConcernService;
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
@RequestMapping("/api/review-concerns")
@RequiredArgsConstructor
@Tag(name = "Review Concern Management")
public class ReviewConcernController {

    private final ReviewConcernService reviewConcernService;

    @PostMapping
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ReviewConcernResponse> createConcern(
            @Valid @RequestBody CreateReviewConcernRequest request,
            @AuthenticationPrincipal CustomUserDetails host
    ) {

        ReviewConcernResponse response =
                reviewConcernService.createConcern(request, host);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewConcernResponse> getConcernById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                reviewConcernService.getConcernById(id)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<ReviewConcernResponse>> getConcerns(
            @ModelAttribute ReviewConcernFilterRequest filter,
            @PageableDefault(size = 10, sort = "createdAt")
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                reviewConcernService.getFilteredConcerns(filter, pageable)
        );
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReviewConcernResponse> updateStatus(
            @PathVariable("id") Long id,
            @RequestParam ConcernStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        return ResponseEntity.ok(
                reviewConcernService.updateConcernStatus(
                        id,
                        status,
                        userDetails
                )
        );
    }

}
