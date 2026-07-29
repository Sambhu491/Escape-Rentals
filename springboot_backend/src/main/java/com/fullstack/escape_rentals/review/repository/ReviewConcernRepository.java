package com.fullstack.escape_rentals.review.repository;

import com.fullstack.escape_rentals.review.entity.ReviewConcernEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ReviewConcernRepository extends JpaRepository<ReviewConcernEntity,Long>,
        JpaSpecificationExecutor<ReviewConcernEntity> {
    boolean existsByReviewIdAndHostId(Long reviewId, Long hostId);
}
