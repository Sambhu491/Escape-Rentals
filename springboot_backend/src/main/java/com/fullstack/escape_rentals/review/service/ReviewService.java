package com.fullstack.escape_rentals.review.service;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewFilterRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse addReview(CreateReviewRequest request, Long guestId);
    ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request, CustomUserDetails userDetails);
    ReviewResponse getReviewById(Long id);
    Page<ReviewResponse> getPropertyReviews(Long propertyId, Pageable pageable);
    Page<ReviewResponse> getReviews(ReviewFilterRequest filter, Pageable pageable);
    void deleteReview(Long reviewId, CustomUserDetails userDetails);
}
