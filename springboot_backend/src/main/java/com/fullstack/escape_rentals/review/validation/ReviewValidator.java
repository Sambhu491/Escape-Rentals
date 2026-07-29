package com.fullstack.escape_rentals.review.validation;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReviewValidator {
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public void validateCanReview(Long guestId, Long propertyId) {

        // Loosened from "COMPLETED only" — a guest can review as soon as their
        // booking is confirmed and paid, not only after checkout has passed.
        boolean eligibleStay =
                bookingRepository.existsByGuestIdAndPropertyIdAndStatusIn(
                        guestId,
                        propertyId,
                        List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED)
                );

        if (!eligibleStay) {
            throw new BadRequestException(
                    "You can only review a property once your booking is confirmed and paid."
            );
        }

        boolean alreadyReviewed =
                reviewRepository.existsByPropertyIdAndGuestId(propertyId, guestId);

        if (alreadyReviewed) {
            throw new BadRequestException(
                    "You have already reviewed this property."
            );
        }
    }

    public void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
    }
}
