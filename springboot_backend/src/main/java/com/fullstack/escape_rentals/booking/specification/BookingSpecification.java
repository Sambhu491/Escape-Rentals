package com.fullstack.escape_rentals.booking.specification;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class BookingSpecification {
    private BookingSpecification() {}

    public static Specification<BookingEntity> hasUserId(Long userId) {
        return (root, query, cb) ->
                userId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("guest").get("id"), userId);
    }

    public static Specification<BookingEntity> hasPropertyId(Long propertyId) {
        return (root, query, cb) ->
                propertyId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("property").get("id"), propertyId);
    }

    public static Specification<BookingEntity> hasHostId(Long hostId) {
        return (root, query, cb) ->
                hostId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("property").get("host").get("id"), hostId);
    }

    public static Specification<BookingEntity> hasStatus(BookingStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()
                        : cb.equal(root.get("status"), status);
    }


    public static Specification<BookingEntity> checkInAfter(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(root.get("checkInDate"), date);
    }

    public static Specification<BookingEntity> checkInBefore(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(root.get("checkInDate"), date);
    }

    public static Specification<BookingEntity> checkOutAfter(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.greaterThanOrEqualTo(root.get("checkOutDate"), date);
    }

    public static Specification<BookingEntity> checkOutBefore(LocalDate date) {
        return (root, query, cb) ->
                date == null
                        ? cb.conjunction()
                        : cb.lessThanOrEqualTo(root.get("checkOutDate"), date);
    }


    public static Specification<BookingEntity> upcoming() {
        return (root, query, cb) ->
                cb.greaterThan(root.get("checkInDate"), LocalDate.now());
    }

    public static Specification<BookingEntity> active() {
        LocalDate today = LocalDate.now();

        return (root, query, cb) -> cb.and(
                cb.lessThanOrEqualTo(root.get("checkInDate"), today),
                cb.greaterThanOrEqualTo(root.get("checkOutDate"), today)
        );
    }

    public static Specification<BookingEntity> completed() {
        return (root, query, cb) ->
                cb.lessThan(root.get("checkOutDate"), LocalDate.now());
    }
}
