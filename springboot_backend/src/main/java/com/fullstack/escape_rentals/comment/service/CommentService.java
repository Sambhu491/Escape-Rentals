package com.fullstack.escape_rentals.comment.service;

import com.fullstack.escape_rentals.comment.dto.request.CreateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.request.UpdateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.response.CommentResponse;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CommentService {
    CommentResponse createComment(CreateCommentRequest request, CustomUserDetails currentUser);

    Page<CommentResponse> getPropertyComments(Long propertyId, Pageable pageable);

    List<CommentResponse> getReplies(Long commentId);

    CommentResponse updateComment(Long id, UpdateCommentRequest request, CustomUserDetails currentUser);

    void deleteComment(Long id, CustomUserDetails currentUser);

    // Admin-only moderation surface — every comment platform-wide, including
    // ones a host has soft-deleted (so they can be reviewed and restored).
    Page<CommentResponse> getAllCommentsForAdmin(Pageable pageable);

    CommentResponse restoreComment(Long id, CustomUserDetails currentUser);
}
