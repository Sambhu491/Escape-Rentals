package com.fullstack.escape_rentals.review.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewReplyResponse {
    private Long id;
    private Long reviewId;
    private Long hostId;
    private String hostName;
    private String message;
    private LocalDateTime createdAt;
}
