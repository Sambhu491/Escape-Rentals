package com.fullstack.escape_rentals.review.dto.response;

import lombok.Builder;
import lombok.Getter;


import java.time.LocalDateTime;

@Getter
@Builder
public class ReviewResponse {
    private Long id;

    private Long propertyId;
    private String propertyTitle;

    private Long guestId;
    private String guestName;

    private Integer rating;
    private String comment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
