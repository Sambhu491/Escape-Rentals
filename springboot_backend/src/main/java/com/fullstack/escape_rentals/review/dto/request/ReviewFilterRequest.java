package com.fullstack.escape_rentals.review.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReviewFilterRequest {
    private Long propertyId;
    private Long guestId;
    private Integer rating;
    private Integer minRating;
    private Integer maxRating;
    private LocalDate createdFrom;
    private LocalDate createdTo;
    private String keyword;
}
