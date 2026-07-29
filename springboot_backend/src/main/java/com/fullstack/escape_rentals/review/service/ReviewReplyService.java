package com.fullstack.escape_rentals.review.service;

import com.fullstack.escape_rentals.review.dto.request.CreateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.request.UpdateReviewReplyRequest;
import com.fullstack.escape_rentals.review.dto.response.ReviewReplyResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;

import java.util.List;

public interface ReviewReplyService  {
    ReviewReplyResponse createReply(CreateReviewReplyRequest request, CustomUserDetails host);
    ReviewReplyResponse updateReply(Long replyId, UpdateReviewReplyRequest request, CustomUserDetails host);
    List<ReviewReplyResponse> getRepliesByReview(Long reviewId);
    void deleteReply(Long replyId, CustomUserDetails user);
}
