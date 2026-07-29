package com.fullstack.escape_rentals.review.mapper;

import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.review.dto.request.CreateReviewRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewResponse;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewEntity toEntity(
            CreateReviewRequest request,
            PropertyEntity property,
            UserEntity guest
    ) {
        return ReviewEntity.builder()
                .property(property)
                .guest(guest)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();
    }
    public ReviewResponse toResponse(ReviewEntity review) {

        String guestName =
                review.getGuest() != null
                        ? review.getGuest().getFirstName() + " " + review.getGuest().getLastName()
                        : null;

        return ReviewResponse.builder()
                .id(review.getId())

                .propertyId(
                        review.getProperty() != null
                                ? review.getProperty().getId()
                                : null
                )
                .propertyTitle(
                        review.getProperty() != null
                                ? review.getProperty().getTitle()
                                : null
                )

                .guestId(
                        review.getGuest() != null
                                ? review.getGuest().getId()
                                : null
                )
                .guestName(guestName)

                .rating(review.getRating())
                .comment(review.getComment())

                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())

                .build();
    }

    public void updateEntity(
            ReviewEntity review,
            UpdateReviewRequest request
    ) {
        if (request == null) return;

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }

        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }
    }
}
