package com.fullstack.escape_rentals.review.dto.response;

import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewConcernResponse {
    private Long id;
    private Long reviewId;
    private Long hostId;
    private String hostName;
    private String reason;
    private ConcernStatus status;
    private LocalDateTime createdAt;

    // Added so an admin can see and act on the flagged review directly from
    // the concern — previously only the raw reviewId was exposed, forcing a
    // separate lookup before the admin could judge whether to delete it.
    private String propertyTitle;
    private String reviewGuestName;
    private Integer reviewRating;
    private String reviewComment;
}
