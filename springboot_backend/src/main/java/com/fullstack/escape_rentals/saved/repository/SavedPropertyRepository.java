package com.fullstack.escape_rentals.saved.repository;

import com.fullstack.escape_rentals.saved.entity.SavedPropertyEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SavedPropertyRepository extends JpaRepository<SavedPropertyEntity, Long> {

    boolean existsByUserIdAndPropertyId(Long userId, Long propertyId);

    Optional<SavedPropertyEntity> findByUserIdAndPropertyId(Long userId, Long propertyId);

    Page<SavedPropertyEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Backs the heart-icon state on property cards across the site — one
    // lightweight call up front instead of a per-card existence check.
    @Query("SELECT s.property.id FROM SavedPropertyEntity s WHERE s.user.id = :userId")
    List<Long> findPropertyIdsByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndPropertyId(Long userId, Long propertyId);
}
