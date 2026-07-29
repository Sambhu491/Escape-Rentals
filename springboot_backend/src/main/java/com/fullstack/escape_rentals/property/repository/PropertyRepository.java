package com.fullstack.escape_rentals.property.repository;

import com.fullstack.escape_rentals.booking.entity.BookingEntity;
import com.fullstack.escape_rentals.booking.entity.BookingStatus;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.entity.PropertyStatus;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository
        extends JpaRepository<PropertyEntity,Long> ,
        JpaSpecificationExecutor<PropertyEntity> {

    @Override
    @EntityGraph(attributePaths = {"host", "category"})
    Page<PropertyEntity> findAll(Specification<PropertyEntity> spec, Pageable pageable);

    @EntityGraph(attributePaths = {"host", "category"})
    Optional<PropertyEntity> findById(Long id);

    boolean existsByTitleAndHostIdAndDeletedFalse(String title, Long hostId);

    @EntityGraph(attributePaths = {"host", "category"})
    List<PropertyEntity> findAllByHostId(Long hostId);

    boolean existsByTitleAndHostIdAndIdNot(String title, Long hostId, Long id);

    long countByHostId(Long hostId);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
    SELECT p
    FROM PropertyEntity p
    WHERE p.id = :id
""")
    Optional<PropertyEntity> findByIdForUpdate(
            @Param("id") Long id
    );

    long countByCategoryId(Long categoryId);

    Optional<PropertyEntity> findByIdAndDeletedFalse(Long id);

    long countByHostIdAndDeletedFalse(Long hostId);


    Long countByDeletedFalse();

    Long countByStatusAndDeletedFalse(PropertyStatus propertyStatus);

    @Query("""
    SELECT DISTINCT p.city
    FROM PropertyEntity p
    WHERE p.deleted = false
      AND p.status = "AVAILABLE"
    ORDER BY p.city
""")
    List<String> findDistinctCities();

    List<PropertyEntity> findAllByHostIdAndDeletedFalse(Long currentHostId);
}
