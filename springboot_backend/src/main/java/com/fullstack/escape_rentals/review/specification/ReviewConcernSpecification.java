package com.fullstack.escape_rentals.review.specification;

import com.fullstack.escape_rentals.review.entity.ConcernStatus;
import com.fullstack.escape_rentals.review.entity.ReviewConcernEntity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ReviewConcernSpecification {

    private ReviewConcernSpecification() {}

    public static Specification<ReviewConcernEntity> hasStatus(
            ConcernStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction()
                        : cb.equal(root.get("status"), status);
    }

    public static Specification<ReviewConcernEntity> hasHostId(Long hostId) {
        return (root, query, cb) ->
                hostId == null ? cb.conjunction()
                        : cb.equal(root.get("host").get("id"), hostId);
    }

    public static Specification<ReviewConcernEntity> hasReviewId(Long reviewId) {
        return (root, query, cb) ->
                reviewId == null ? cb.conjunction()
                        : cb.equal(root.get("review").get("id"), reviewId);
    }

    public static Specification<ReviewConcernEntity> createdAfter(LocalDate from) {
        return (root, query, cb) ->
                from == null ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(
                        root.get("createdAt"),
                        from.atStartOfDay()
                );
    }

    public static Specification<ReviewConcernEntity> createdBefore(LocalDate to) {
        return (root, query, cb) ->
                to == null ? cb.conjunction()
                        : cb.lessThanOrEqualTo(
                        root.get("createdAt"),
                        to.atTime(23, 59, 59)
                );
    }
}
