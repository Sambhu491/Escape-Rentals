package com.fullstack.escape_rentals.review.controller;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewReplyResponse;
import com.fullstack.escape_rentals.review.service.ReviewReplyService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/review-replies")
@RequiredArgsConstructor
@Tag(name = "Host Review Reply Management")
public class ReviewReplyController {

    private final ReviewReplyService reviewReplyService;


    @PostMapping
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ReviewReplyResponse> createReply(
            @Valid @RequestBody CreateReviewReplyRequest request,
            @AuthenticationPrincipal CustomUserDetails host
    ) {
        ReviewReplyResponse response =
                reviewReplyService.createReply(request, host);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HOST')")
    public ResponseEntity<ReviewReplyResponse> updateReply(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewReplyRequest request,
            @AuthenticationPrincipal CustomUserDetails host
    ) {

        return ResponseEntity.ok(
                reviewReplyService.updateReply(
                        id,
                        request,
                        host
                )
        );
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<List<ReviewReplyResponse>> getRepliesByReview(
            @PathVariable Long reviewId
    ) {

        return ResponseEntity.ok(
                reviewReplyService.getRepliesByReview(reviewId)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('HOST','ADMIN')")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        reviewReplyService.deleteReply(id, user);

        return ResponseEntity.noContent().build();
    }
}
