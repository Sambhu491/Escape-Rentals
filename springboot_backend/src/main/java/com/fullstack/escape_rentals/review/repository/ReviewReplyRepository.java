package com.fullstack.escape_rentals.review.repository;

import com.fullstack.escape_rentals.review.entity.ReviewReplyEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewReplyRepository extends JpaRepository<ReviewReplyEntity, Long> {

    List<ReviewReplyEntity> findByReviewId(Long reviewId);
    boolean existsByReviewId(Long id);
}
