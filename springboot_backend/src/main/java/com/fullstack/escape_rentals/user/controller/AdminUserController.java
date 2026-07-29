package com.fullstack.escape_rentals.user.controller;

import com.fullstack.escape_rentals.user.dto.request.DisableAccountRequest;
import com.fullstack.escape_rentals.user.dto.response.UserResponse;
import com.fullstack.escape_rentals.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Management")
public class AdminUserController {

    private final UserService userService;


    @GetMapping
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(
                userService.getAllUsers(pageable)
        );
    }

    @PatchMapping("/{id}/disable")
    public ResponseEntity<Void> disableUser(
            @PathVariable Long id,
            @Valid @RequestBody DisableAccountRequest request
    ){

        userService.disableUser(id, request);

        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/enable")
    public ResponseEntity<Void> enableUser(
            @PathVariable Long id
    ){

        userService.enableUser(id);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id
    ){

        return ResponseEntity.ok(
                userService.getUserById(id)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserByAdmin(
            @PathVariable Long id
    ){
        userService.deleteUserByAdmin(id);
        return ResponseEntity.noContent().build();
    }
}













