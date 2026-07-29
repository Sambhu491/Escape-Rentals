package com.fullstack.escape_rentals.review.serviceImpl;

import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.booking.repository.BookingRepository;
import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.review.dto.request.CreateReviewRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewFilterRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewResponse;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.review.mapper.ReviewMapper;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import com.fullstack.escape_rentals.review.service.ReviewService;
import com.fullstack.escape_rentals.review.specification.ReviewSpecification;
import com.fullstack.escape_rentals.review.validation.ReviewValidator;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewMapper reviewMapper;
    private final ReviewValidator reviewValidator;
    private final InAppNotificationService inAppNotificationService;

    @Override
    @Transactional
    public ReviewResponse addReview(CreateReviewRequest request, Long guestId) {

        PropertyEntity property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        UserEntity user = userRepository.findById(guestId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        reviewValidator.validateRating(request.getRating());

        reviewValidator.validateCanReview(
                guestId,
                property.getId()
        );

        ReviewEntity review = reviewMapper.toEntity(
                request,
                property,
                user
        );

        reviewRepository.save(review);

        if (property.getHost() != null) {
            inAppNotificationService.notify(
                    property.getHost(),
                    NotificationType.REVIEW,
                    "New review",
                    user.getFirstName() + " left a " + request.getRating() + "-star review on \"" + property.getTitle() + "\".",
                    review.getId()
            );
        }

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request, CustomUserDetails userDetails) {

        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> Objects.equals(auth.getAuthority(), "ROLE_ADMIN"));

        boolean isReviewOwner  = review.getGuest() != null
                && Objects.equals(review.getGuest().getId(), userDetails.getId());

        if (!isAdmin && !isReviewOwner) {
            throw new AccessDeniedException("Not allowed to update this review");
        }

        reviewMapper.updateEntity(review, request);

        return reviewMapper.toResponse(reviewRepository.save(review));
    }

    // ---------------- GET SINGLE REVIEW (PUBLIC) ----------------
    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        ReviewEntity review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        return reviewMapper.toResponse(review);
    }


    // ---------------- GET PROPERTY REVIEWS ----------------
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getPropertyReviews(Long propertyId, Pageable pageable) {

        if (!propertyRepository.existsById(propertyId)) {
            throw new ResourceNotFoundException("Property not found");
        }

        return reviewRepository
                .findByPropertyId(propertyId, pageable)
                .map(reviewMapper::toResponse);
    }

    // ---------------- FILTERED REVIEWS ----------------
    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviews(ReviewFilterRequest filter, Pageable pageable) {

        Specification<ReviewEntity> spec = Specification
                .where(ReviewSpecification.hasPropertyId(filter.getPropertyId()))
                .and(ReviewSpecification.hasGuestId(filter.getGuestId()))
                .and(ReviewSpecification.hasRating(filter.getRating()))
                .and(ReviewSpecification.minRating(filter.getMinRating()))
                .and(ReviewSpecification.maxRating(filter.getMaxRating()))
                .and(ReviewSpecification.createdAfter(filter.getCreatedFrom()))
                .and(ReviewSpecification.createdBefore(filter.getCreatedTo()));

        return reviewRepository.findAll(spec, pageable)
                .map(reviewMapper::toResponse);
    }

    // ---------------- DELETE REVIEW ----------------
    @Override
    @Transactional
    public void deleteReview(Long reviewId, CustomUserDetails userDetails) {

        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));


        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(auth -> Objects.equals(auth.getAuthority(), "ROLE_ADMIN"));

        boolean isReviewOwner  = review.getGuest() != null
                && Objects.equals(review.getGuest().getId(), userDetails.getId());

        if ( !isReviewOwner  && !isAdmin) {
            throw new AccessDeniedException("Not allowed to delete this review");
        }

        reviewRepository.delete(review);
    }

}
