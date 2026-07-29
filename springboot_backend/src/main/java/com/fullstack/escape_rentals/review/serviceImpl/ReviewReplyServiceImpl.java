package com.fullstack.escape_rentals.review.serviceImpl;

import com.fullstack.escape_rentals.exception.AccessDeniedException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.notification.entity.NotificationType;
import com.fullstack.escape_rentals.notification.service.InAppNotificationService;
import com.fullstack.escape_rentals.review.dto.request.CreateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewReplyResponse;
import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import com.fullstack.escape_rentals.review.entity.ReviewReplyEntity;
import com.fullstack.escape_rentals.review.mapper.ReviewReplyMapper;
import com.fullstack.escape_rentals.review.repository.ReviewReplyRepository;
import com.fullstack.escape_rentals.review.repository.ReviewRepository;
import com.fullstack.escape_rentals.review.service.ReviewReplyService;
import com.fullstack.escape_rentals.review.validation.ReviewModerationValidator;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewReplyServiceImpl implements ReviewReplyService {
    private final ReviewReplyRepository replyRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final ReviewReplyMapper mapper;
    private final ReviewModerationValidator validator;
    private final InAppNotificationService inAppNotificationService;

    @Override
    public ReviewReplyResponse createReply(CreateReviewReplyRequest request, CustomUserDetails hostDetails) {

        ReviewEntity review = reviewRepository.findById(request.getReviewId())
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        validator.validateCanReply(review, hostDetails.getId());

        UserEntity host = userRepository.getReferenceById(hostDetails.getId());

        ReviewReplyEntity reply = mapper.toEntity(request, review, host);
        ReviewReplyResponse response = mapper.toResponse(replyRepository.save(reply));

        if (review.getGuest() != null) {
            inAppNotificationService.notify(
                    review.getGuest(),
                    NotificationType.REVIEW_REPLY,
                    "Host replied to your review",
                    host.getFirstName() + " replied to your review" +
                            (review.getProperty() != null ? " on \"" + review.getProperty().getTitle() + "\"." : "."),
                    review.getId()
            );
        }

        return response;
    }

    @Override
    public ReviewReplyResponse updateReply(Long replyId,
                                           UpdateReviewReplyRequest request,
                                           CustomUserDetails hostDetails) {

        ReviewReplyEntity reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found"));

        if (!reply.getHost().getId().equals(hostDetails.getId())) {
            throw new AccessDeniedException("You can only update your own reply");
        }

        mapper.updateEntity(reply, request);

        return mapper.toResponse(replyRepository.save(reply));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewReplyResponse> getRepliesByReview(Long reviewId) {

        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found");
        }

        return replyRepository.findByReviewId(reviewId)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    public void deleteReply(Long replyId, CustomUserDetails userDetails) {

        ReviewReplyEntity reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ResourceNotFoundException("Reply not found"));

        boolean isOwner = reply.getHost().getId().equals(userDetails.getId());

        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(a -> Objects.equals(a.getAuthority(), "ROLE_ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new AccessDeniedException("Not allowed to delete this reply");
        }

        replyRepository.delete(reply);
    }
}
