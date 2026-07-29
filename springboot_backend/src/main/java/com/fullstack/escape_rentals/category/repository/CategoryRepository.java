package com.fullstack.escape_rentals.category.repository;

import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity,Long> {
    Optional<CategoryEntity>  findByName(String name);
    boolean existsByName(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
    Optional<CategoryEntity> findByIdAndActiveTrue(Long id);
    List<CategoryEntity> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}
