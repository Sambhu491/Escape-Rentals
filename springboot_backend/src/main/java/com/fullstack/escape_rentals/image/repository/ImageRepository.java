package com.fullstack.escape_rentals.image.repository;

import com.fullstack.escape_rentals.image.entity.ImageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<ImageEntity,Long> {

    List<ImageEntity> findByPropertyId(Long propertyId);

    Optional<ImageEntity> findByIdAndPropertyId(Long imageId, Long propertyId);
}
