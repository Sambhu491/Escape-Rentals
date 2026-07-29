package com.fullstack.escape_rentals.property.specification;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDate;

public class PropertySpecification {

    public static Specification<PropertyEntity> hasCity(String city) {
        return (root, query, cb) ->
                (city == null || city.isBlank())
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("city")),
                        "%" + city.toLowerCase().trim() + "%");
    }

    public static Specification<PropertyEntity> hasCountry(String country) {
        return (root, query, cb) ->
                (country == null || country.isBlank())
                        ? cb.conjunction()
                        : cb.equal(cb.lower(root.get("country")),
                        country.toLowerCase().trim());
    }

    public static Specification<PropertyEntity> hasCategory(Long categoryId) {
        return (root, query, cb) ->
                categoryId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<PropertyEntity> hasPriceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return cb.conjunction();

            if (min != null && max != null) {
                return cb.between(root.get("pricePerNight"), min, max);
            } else if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("pricePerNight"), min);
            } else {
                return cb.lessThanOrEqualTo(root.get("pricePerNight"), max);
            }
        };
    }

    public static Specification<PropertyEntity> hasStatus(PropertyStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()
                        : cb.equal(root.get("status"),status);
    }

    public static Specification<PropertyEntity> onlyActiveListings() {
        return (root, query, cb) ->
                cb.and(
                        cb.equal(
                                root.get("status"),
                                PropertyStatus.AVAILABLE
                        ),
                        cb.equal(
                                root.get("deleted"),
                                false
                        )
                );
    }

    public static Specification<PropertyEntity> hasGuestCapacity(Integer guests) {
        return (root,query,cb) -> {
            if(guests == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("maxGuests"),guests);
        };
    }

    public static Specification<PropertyEntity> hasBedrooms(Integer bedrooms) {
        return (root,query,cb) -> {
            if(bedrooms == null) {
                return cb.conjunction();
            }
            return cb.greaterThanOrEqualTo(root.get("bedrooms"),bedrooms);
        };
    }

    public static Specification<PropertyEntity> hasState(String state){
        return (root,query,cb) -> {
            if(state == null || state.isBlank()) {
                return cb.conjunction();
            }

            return cb.like(
                    cb.lower(root.get("state")),
                    "%"+state.toLowerCase().trim()+"%"
            );
        };
    }

    public static Specification<PropertyEntity> isAvailable(
            LocalDate checkIn,
            LocalDate checkOut
    ) {
        return (root, query, cb) -> {
            if(checkIn == null || checkOut == null) {
                return cb.conjunction();
            }
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<BookingEntity> booking =
                    subquery.from(BookingEntity.class);
            subquery.select(booking.get("property").get("id"));
            subquery.where(
                    cb.equal(
                            booking.get("property").get("id"),
                            root.get("id")
                    ),
                    booking.get("status")
                            .in(
                                    BookingStatus.PENDING,
                                    BookingStatus.CONFIRMED
                            ),
                    cb.lessThan(
                            booking.get("checkInDate"),
                            checkOut
                    ),
                    cb.greaterThan(
                            booking.get("checkOutDate"),
                            checkIn
                    )
            );

            return cb.not(
                    cb.exists(subquery)
            );
        };
    }

}
