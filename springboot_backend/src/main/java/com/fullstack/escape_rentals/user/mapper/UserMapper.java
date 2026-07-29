package com.fullstack.escape_rentals.user.mapper;

import com.fullstack.escape_rentals.user.dto.response.UserResponse;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {
    public UserResponse toResponse(UserEntity user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.isEnabled())
                .disabledUntil(user.getDisabledUntil())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
