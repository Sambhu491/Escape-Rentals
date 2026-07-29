package com.fullstack.escape_rentals.category.service;

import com.fullstack.escape_rentals.category.dto.request.CreateCategoryRequest;
import com.fullstack.escape_rentals.category.dto.request.UpdateCategoryRequest;
import com.fullstack.escape_rentals.category.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse getCategoryById(Long id);
    List<CategoryResponse> getAllCategories();
    CategoryResponse createCategory(CreateCategoryRequest request);
    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request);
    void deleteCategory(Long id);
    void deactivateCategory(Long id);
}
