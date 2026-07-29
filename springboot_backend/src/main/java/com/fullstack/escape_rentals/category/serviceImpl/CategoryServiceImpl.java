package com.fullstack.escape_rentals.category.serviceImpl;

import com.fullstack.escape_rentals.category.dto.request.CreateCategoryRequest;
import com.fullstack.escape_rentals.category.dto.request.UpdateCategoryRequest;
import com.fullstack.escape_rentals.category.dto.response.CategoryResponse;
import com.fullstack.escape_rentals.category.entity.CategoryEntity;
import com.fullstack.escape_rentals.category.mapper.CategoryMapper;
import com.fullstack.escape_rentals.category.repository.CategoryRepository;
import com.fullstack.escape_rentals.category.service.CategoryService;
import com.fullstack.escape_rentals.exception.BadRequestException;
import com.fullstack.escape_rentals.exception.DuplicateResourceException;
import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final PropertyRepository propertyRepository;

    @Override
    @Transactional
    public CategoryResponse getCategoryById(Long id){
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(()->new ResourceNotFoundException("Category not found with id: "+id));
        return categoryMapper.toResponse((category));
    }

    @Override
    public List<CategoryResponse> getAllCategories(){
        return categoryRepository.findByActiveTrue()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request){

        if(categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new DuplicateResourceException(
                    "Category name '" + request.getName() + "' already exists!"
            );
        }
        CategoryEntity category = CategoryEntity.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        CategoryEntity savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request){
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(()-> new ResourceNotFoundException("Category not found with id: "+id));
        if(request.getName() != null &&
                categoryRepository.existsByNameIgnoreCaseAndIdNot(request.getName(), id)) {
            throw new DuplicateResourceException("Another category with the name '"+request.getName()+"' already exists!");
        }

        if(request.getName() != null) {
            category.setName(request.getName());
        }
        if(request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if(request.getActive() != null) {
            category.setActive(request.getActive());
        }
        CategoryEntity updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }


    @Override
    @Transactional
    public void deleteCategory(Long id) {
        CategoryEntity category = categoryRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Category not found")
                );
        long propertyCount = propertyRepository.countByCategoryId(id);

        if(propertyCount > 0){
            throw new BadRequestException(
                    "Cannot delete category because properties are using it"
            );
        }
        categoryRepository.delete(category);
    }

    @Override
    @Transactional
    public void deactivateCategory(Long id){
        CategoryEntity category =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Category not found")
                        );

        if(!category.isActive()) {
            throw new BadRequestException("Category Already Deactivated");
        }

        category.setActive(false);
    }

}


















