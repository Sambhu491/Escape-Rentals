package com.fullstack.escape_rentals.review.dto.request;

import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import jakarta.validation.constraints.PastOrPresent;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class ReviewConcernFilterRequest {
    private ConcernStatus status;
    private Long hostId;
    private Long reviewId;

    @PastOrPresent(message = "createdFrom cannot be in the future")
    private LocalDate createdFrom;

    @PastOrPresent(message = "createdTo cannot be in the future")
    private LocalDate createdTo;
}
