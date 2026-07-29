package com.fullstack.escape_rentals.review.specification;

import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class ReviewSpecification {
    private ReviewSpecification() {}

    // ---------------- PROPERTY ----------------
    public static Specification<ReviewEntity> hasPropertyId(Long propertyId) {
        return (root, query, cb) ->
                propertyId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("property").get("id"), propertyId);
    }

    // ---------------- USER ----------------
    public static Specification<ReviewEntity> hasGuestId(Long guestId) {
        return (root, query, cb) ->
                guestId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("guest").get("id"), guestId);
    }

    // ---------------- EXACT RATING ----------------
    public static Specification<ReviewEntity> hasRating(Integer rating) {
        return (root, query, cb) ->
                rating == null
                        ? cb.conjunction()
                        : cb.equal(root.get("rating"), rating);
    }

    // ---------------- MIN RATING ----------------
    public static Specification<ReviewEntity> minRating(Integer minRating) {
        return (root, query, cb) ->
                minRating == null
                        ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(root.get("rating"), minRating);
    }

    // ---------------- MAX RATING ----------------
    public static Specification<ReviewEntity> maxRating(Integer maxRating) {
        return (root, query, cb) ->
                maxRating == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(root.get("rating"), maxRating);
    }


    // ---------------- CREATED AFTER ----------------
    public static Specification<ReviewEntity> createdAfter(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(root.get("createdAt"), date.atStartOfDay());
    }

    // ---------------- CREATED BEFORE ----------------
    public static Specification<ReviewEntity> createdBefore(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(root.get("createdAt"), date.atTime(23, 59, 59));
    }
}
