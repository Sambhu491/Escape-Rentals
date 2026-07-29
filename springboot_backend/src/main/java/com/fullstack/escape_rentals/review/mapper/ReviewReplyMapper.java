package com.fullstack.escape_rentals.review.mapper;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewReplyResponse;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.review.entity.ReviewReplyEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ReviewReplyMapper {

    public ReviewReplyEntity toEntity(
            CreateReviewReplyRequest request,
            ReviewEntity review,
            UserEntity host
    ) {
        return ReviewReplyEntity.builder()
                .review(review)
                .host(host)
                .message(request.getMessage())
                .build();
    }

    public ReviewReplyResponse toResponse(ReviewReplyEntity entity) {
        if (entity == null) return null;

        Long reviewId = (entity.getReview() != null) ? entity.getReview().getId() : null;
        Long hostId = (entity.getHost() != null) ? entity.getHost().getId() : null;
        String hostFullName = (entity.getHost() != null)
                ? entity.getHost().getFirstName() + " " + entity.getHost().getLastName()
                : "Unknown Host";

        return ReviewReplyResponse.builder()
                .id(entity.getId())
                .reviewId(reviewId)
                .hostId(hostId)
                .hostName(hostFullName)
                .message(entity.getMessage())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public void updateEntity(
            ReviewReplyEntity entity,
            UpdateReviewReplyRequest request
    ) {
        if (entity == null || request == null) return;

        if (request.getMessage() != null && !request.getMessage().isBlank()) {
            entity.setMessage(request.getMessage());
        }
    }
}
