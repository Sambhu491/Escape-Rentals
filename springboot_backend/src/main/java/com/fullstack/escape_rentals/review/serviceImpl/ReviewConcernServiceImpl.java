package com.fullstack.escape_rentals.review.serviceImpl;

import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.review.dto.request.CreateReviewConcernRequest;
import com.fullstack.escape_rentals.review.dto.request.ReviewConcernFilterRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewConcernResponse;
import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import com.fullstack.escape_rentals.review.entity.ReviewConcernEntity;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.review.mapper.ReviewConcernMapper;
import com.fullstack.escape_rentals.review.repository.ReviewConcernRepository;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import com.fullstack.escape_rentals.review.service.ReviewConcernService;
import com.fullstack.escape_rentals.review.specification.ReviewConcernSpecification;
import com.fullstack.escape_rentals.review.validation.ReviewModerationValidator;
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
@Transactional
public class ReviewConcernServiceImpl implements ReviewConcernService {

    private final ReviewConcernRepository concernRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReviewConcernMapper mapper;
    private final ReviewModerationValidator validator;
    private final InAppNotificationService inAppNotificationService;

    @Override
    @Transactional
    public ReviewConcernResponse createConcern(CreateReviewConcernRequest request, CustomUserDetails hostDetails) {

        ReviewEntity review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        validator.validateCanRaiseConcern(review, hostDetails.getId());

        UserEntity host = userRepository.getReferenceById(hostDetails.getId());

        ReviewConcernEntity concern = mapper.toEntity(request, review, host);
        ReviewConcernResponse response = mapper.toResponse(concernRepository.save(concern));

        inAppNotificationService.notifyAdmins(
                NotificationType.REVIEW_CONCERN,
                "Review flagged for moderation",
                host.getFirstName() + " flagged review #" + review.getId() + " for moderation.",
                concern.getId()
        );

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewConcernResponse getConcernById(Long id) {

        ReviewConcernEntity concern = concernRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Concern not found"));

        return mapper.toResponse(concern);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewConcernResponse> getFilteredConcerns(ReviewConcernFilterRequest filter, Pageable pageable) {

        Specification<ReviewConcernEntity> spec = Specification
                .where(ReviewConcernSpecification.hasStatus(filter.getStatus()))
                .and(ReviewConcernSpecification.hasHostId(filter.getHostId()))
                .and(ReviewConcernSpecification.hasReviewId(filter.getReviewId()))
                .and(ReviewConcernSpecification.createdAfter(filter.getCreatedFrom()))
                .and(ReviewConcernSpecification.createdBefore(filter.getCreatedTo()));

        return concernRepository.findAll(spec, pageable)
                .map(mapper::toResponse);
    }

    @Override
    @Transactional
    public ReviewConcernResponse updateConcernStatus(Long concernId,
                                                     ConcernStatus status,
                                                     CustomUserDetails userDetails) {

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if (!isAdmin) {
            throw new AccessDeniedException("Only admin can update concern status");
        }

        ReviewConcernEntity concern = concernRepository.findById(concernId)
                .orElseThrow(() -> new ResourceNotFoundException("Concern not found"));

        concern.setStatus(status);
        ReviewConcernEntity saved = concernRepository.save(concern);

        if (saved.getHost() != null) {
            inAppNotificationService.notify(
                    saved.getHost(),
                    NotificationType.REVIEW_CONCERN,
                    "Your review appeal was " + status.name().toLowerCase(),
                    "An admin has " + status.name().toLowerCase() + " your appeal about review #" +
                            (saved.getReview() != null ? saved.getReview().getId() : "?") + ".",
                    saved.getId()
            );
        }

        return mapper.toResponse(saved);
    }

}
