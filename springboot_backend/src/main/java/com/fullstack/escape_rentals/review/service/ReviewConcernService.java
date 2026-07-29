package com.fullstack.escape_rentals.review.service;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewConcernRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewConcernFilterRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewConcernResponse;
import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ReviewConcernService {

    ReviewConcernResponse createConcern(CreateReviewConcernRequest request, CustomUserDetails host);
    ReviewConcernResponse getConcernById(Long id);
    Page<ReviewConcernResponse> getFilteredConcerns(ReviewConcernFilterRequest filter, Pageable pageable);
    ReviewConcernResponse updateConcernStatus(Long concernId, ConcernStatus status, CustomUserDetails userDetails);
}
