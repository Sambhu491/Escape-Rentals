package com.fullstack.escape_rentals.comment.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1000, message = "Comment cannot exceed 1000 characters")
    private String content;
}
