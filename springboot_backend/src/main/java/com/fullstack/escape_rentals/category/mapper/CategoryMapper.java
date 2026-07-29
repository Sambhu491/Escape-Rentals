package com.fullstack.escape_rentals.category.mapper;

import com.fullstack.escape_rentals.category.dto.response.CategoryResponse;
import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public CategoryResponse toResponse(CategoryEntity category) {
        if(category == null) {
            return null;
        }
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .active(category.isActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
