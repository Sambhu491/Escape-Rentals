package com.fullstack.escape_rentals.review.mapper;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewConcernRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewConcernResponse;
import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import com.fullstack.escape_rentals.review.entity.ReviewConcernEntity;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class ReviewConcernMapper {

    public ReviewConcernEntity toEntity(
            CreateReviewConcernRequest request,
            ReviewEntity review,
            UserEntity host
    ) {
        return ReviewConcernEntity.builder()
                .review(review)
                .host(host)
                .reason(request.getReason())
                .status(ConcernStatus.PENDING)
                .build();
    }

    public ReviewConcernResponse toResponse(ReviewConcernEntity entity) {
        if (entity == null) return null;
        Long reviewId = (entity.getReview() != null) ? entity.getReview().getId() : null;
        Long hostId = (entity.getHost() != null) ? entity.getHost().getId() : null;
        String hostFullName = (entity.getHost() != null)
                ? entity.getHost().getFirstName() + " " + entity.getHost().getLastName()
                : "Unknown Host";

        var review = entity.getReview();
        String propertyTitle = (review != null && review.getProperty() != null)
                ? review.getProperty().getTitle()
                : null;
        String reviewGuestName = (review != null && review.getGuest() != null)
                ? review.getGuest().getFirstName() + " " + review.getGuest().getLastName()
                : null;

        return ReviewConcernResponse.builder()
                .id(entity.getId())
                .reviewId(reviewId)
                .hostId(hostId)
                .hostName(hostFullName)
                .reason(entity.getReason())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .propertyTitle(propertyTitle)
                .reviewGuestName(reviewGuestName)
                .reviewRating(review != null ? review.getRating() : null)
                .reviewComment(review != null ? review.getComment() : null)
                .build();
    }
}
