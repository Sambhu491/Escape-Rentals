package com.fullstack.escape_rentals.comment.repository;

import com.fullstack.escape_rentals.comment.entity.CommentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    // Public-facing reads never surface soft-deleted comments — only the
    // admin moderation view (plain findAll, inherited) needs to see those.
    Page<CommentEntity> findByPropertyIdAndParentIsNullAndDeletedFalse(Long propertyId, Pageable pageable);

    List<CommentEntity> findByParentIdAndDeletedFalseOrderByCreatedAtAsc(Long parentId);

    long countByParentIdAndDeletedFalse(Long parentId);
}
