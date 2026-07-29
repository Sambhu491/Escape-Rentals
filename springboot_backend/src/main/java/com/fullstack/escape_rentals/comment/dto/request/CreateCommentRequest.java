package com.fullstack.escape_rentals.comment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateCommentRequest {
    @NotNull(message = "Property ID is required")
    private Long propertyId;

    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String content;

    // Null for a top-level comment; set to reply to an existing top-level comment.
    private Long parentCommentId;
}
