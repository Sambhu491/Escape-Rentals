package com.fullstack.escape_rentals.review.repository;

import com.fullstack.escape_rentals.review.entity.ReviewEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<ReviewEntity,Long>
        , JpaSpecificationExecutor<ReviewEntity> {
    Page<ReviewEntity> findByPropertyId(Long propertyId, Pageable pageable);
    boolean existsByPropertyIdAndGuestId(Long propertyId, Long guestId);
    @Query("""
        SELECT AVG(r.rating)
        FROM ReviewEntity r
        WHERE r.property.id = :propertyId
    """)
    Double findAverageRating(@Param("propertyId") Long propertyId);

    @Query("""
        SELECT COUNT(r)
        FROM ReviewEntity r
        WHERE r.property.id = :propertyId
    """)
    Long countByPropertyId(@Param("propertyId") Long propertyId);

    // Dashboard: platform-wide average rating (admin)
    @Query("""
        SELECT AVG(r.rating)
        FROM ReviewEntity r
    """)
    Double findAverageRating();

    // Dashboard: average rating across a host's properties
    @Query("""
        SELECT AVG(r.rating)
        FROM ReviewEntity r
        WHERE r.property.host.id = :hostId
    """)
    Double findAverageRatingByHostId(@Param("hostId") Long hostId);
}
















