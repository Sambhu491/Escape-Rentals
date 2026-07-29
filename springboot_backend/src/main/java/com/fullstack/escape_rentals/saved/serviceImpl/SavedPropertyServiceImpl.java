package com.fullstack.escape_rentals.saved.serviceImpl;

import com.fullstack.escape_rentals.exception.ResourceNotFoundException;
import com.fullstack.escape_rentals.property.dto.response.PropertyResponse;
import com.fullstack.escape_rentals.property.entity.PropertyEntity;
import com.fullstack.escape_rentals.property.repository.PropertyRepository;
import com.fullstack.escape_rentals.property.service.PropertyService;
import com.fullstack.escape_rentals.saved.entity.SavedPropertyEntity;
import com.fullstack.escape_rentals.saved.repository.SavedPropertyRepository;
import com.fullstack.escape_rentals.saved.service.SavedPropertyService;
import com.fullstack.escape_rentals.security.CustomUserDetails;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedPropertyServiceImpl implements SavedPropertyService {

    private final SavedPropertyRepository savedPropertyRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    // Reused as-is — already attaches averageRating/reviewCount the same way
    // property search/detail do, so a saved listing looks identical everywhere.
    private final PropertyService propertyService;

    @Override
    @Transactional
    public void saveProperty(Long propertyId, CustomUserDetails currentUser) {

        if (savedPropertyRepository.existsByUserIdAndPropertyId(currentUser.getId(), propertyId)) {
            return; // idempotent — saving twice is a no-op, not an error
        }

        PropertyEntity property = propertyRepository.findByIdAndDeletedFalse(propertyId)
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        UserEntity user = userRepository.getReferenceById(currentUser.getId());

        SavedPropertyEntity saved = SavedPropertyEntity.builder()
                .user(user)
                .property(property)
                .build();

        savedPropertyRepository.save(saved);
    }

    @Override
    @Transactional
    public void unsaveProperty(Long propertyId, CustomUserDetails currentUser) {
        savedPropertyRepository.deleteByUserIdAndPropertyId(currentUser.getId(), propertyId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyResponse> getMySavedProperties(Long userId, Pageable pageable) {

        Page<SavedPropertyEntity> page =
                savedPropertyRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        List<PropertyResponse> responses = new ArrayList<>();

        for (SavedPropertyEntity saved : page.getContent()) {
            try {
                responses.add(propertyService.getPropertyById(saved.getProperty().getId()));
            } catch (ResourceNotFoundException ex) {
                // The listing was removed after being bookmarked — drop the
                // stale save instead of breaking the whole wishlist page.
                savedPropertyRepository.delete(saved);
            }
        }

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getMySavedPropertyIds(Long userId) {
        return savedPropertyRepository.findPropertyIdsByUserId(userId);
    }
}
