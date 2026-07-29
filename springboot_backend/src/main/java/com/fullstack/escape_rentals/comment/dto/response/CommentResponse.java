package com.fullstack.escape_rentals.comment.dto.response;

import com.fullstack.escape_rentals.comment.entity.AuthorBadge;
import com.fullstack.escape_rentals.user.entity.Role;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class CommentResponse {
    private Long id;

    private Long propertyId;
    private String propertyTitle;

    private Long authorId;
    private String authorName;
    private Role authorRole;
    private AuthorBadge authorBadge;

    private String content;

    private Long parentCommentId;
    private long replyCount;

    // Only populated (and only ever true) on the admin moderation listing —
    // public reads exclude soft-deleted comments entirely.
    private boolean deleted;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
