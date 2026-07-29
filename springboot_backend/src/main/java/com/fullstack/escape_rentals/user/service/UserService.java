package com.fullstack.escape_rentals.user.service;

import com.fullstack.escape_rentals.user.dto.request.DisableAccountRequest;
import com.fullstack.escape_rentals.user.dto.request.UpdateUserRequest;
import com.fullstack.escape_rentals.user.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse updateUser(Long id,UpdateUserRequest request);
    void deleteUserByAdmin(Long id);
    void deleteOwnAccount();
    void disableUser(Long id, DisableAccountRequest request);
    void enableUser(Long id);
    Page<UserResponse> getAllUsers(Pageable pageable);
}
