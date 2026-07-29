package com.fullstack.escape_rentals.review.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateReviewReplyRequest {
    @NotBlank(message = "Reply cannot be blank")
    @Size(max = 2000, message = "Reply cannot exceed 2000 characters")
    private String message;
}
