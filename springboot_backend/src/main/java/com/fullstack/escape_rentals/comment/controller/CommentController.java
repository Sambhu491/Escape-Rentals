package com.fullstack.escape_rentals.comment.controller;

import com.fullstack.escape_rentals.comment.dto.request.CreateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.request.UpdateCommentRequest;
import com.fullstack.escape_rentals.comment.dto.response.CommentResponse;
import com.fullstack.escape_rentals.comment.service.CommentService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Any authenticated account (USER, HOST, or ADMIN) can leave a comment — unlike
// reviews, which require a completed, paid stay (enforced in ReviewValidator).
@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@Tag(name = "Property Comment Management")
public class CommentController {

    private final CommentService commentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<CommentResponse> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(commentService.createComment(request, user));
    }

    @GetMapping("/property/{propertyId}")
    public ResponseEntity<Page<CommentResponse>> getPropertyComments(
            @PathVariable Long propertyId,
            @PageableDefault(size = 10, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                commentService.getPropertyComments(propertyId, pageable)
        );
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<List<CommentResponse>> getReplies(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                commentService.getReplies(id)
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                commentService.updateComment(id, request, user)
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','HOST','ADMIN')")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        commentService.deleteComment(id, user);
        return ResponseEntity.noContent().build();
    }

    // Admin moderation — every comment platform-wide, including ones a host
    // has soft-deleted, so an admin can review and restore them if needed.
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<CommentResponse>> getAllCommentsForAdmin(
            @PageableDefault(size = 15, sort = "createdAt") Pageable pageable
    ) {
        return ResponseEntity.ok(
                commentService.getAllCommentsForAdmin(pageable)
        );
    }

    @PatchMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommentResponse> restoreComment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        return ResponseEntity.ok(
                commentService.restoreComment(id, user)
        );
    }
}
