package com.fullstack.escape_rentals.review.validation;

import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.review.repository.ReviewConcernRepository;
import com.fullstack.escape_rentals.review.repository.ReviewReplyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
@RequiredArgsConstructor
public class ReviewModerationValidator {
    private final ReviewConcernRepository reviewConcernRepository;
    private final ReviewReplyRepository reviewReplyRepository;

    public void validateCanRaiseConcern(ReviewEntity review, Long hostId) {
        validatePropertyOwnership(review, hostId);
        boolean alreadyReported = reviewConcernRepository.existsByReviewIdAndHostId(review.getId(), hostId);
        if (alreadyReported) {
            throw new BadRequestException("You have already reported this review to the admin moderation queue");
        }
    }

    public void validateCanReply(ReviewEntity review, Long hostId) {
        validatePropertyOwnership(review, hostId);
        boolean alreadyReplied = reviewReplyRepository.existsByReviewId(review.getId());
        if (alreadyReplied) {
            throw new BadRequestException("You have already submitted a reply response for this review");
        }
    }

    private void validatePropertyOwnership(ReviewEntity review, Long hostId) {
        boolean isPropertyHost = review.getProperty() != null
                && review.getProperty().getHost() != null
                && Objects.equals(review.getProperty().getHost().getId(), hostId);

        if (!isPropertyHost) {
            throw new AccessDeniedException("Access denied. You can only interact with reviews on your own properties");
        }
    }

}
