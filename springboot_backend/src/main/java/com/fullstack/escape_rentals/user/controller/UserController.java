package com.fullstack.escape_rentals.user.controller;

import com.fullstack.escape_rentals.user.dto.request.UpdateUserRequest;
import com.fullstack.escape_rentals.user.dto.response.UserResponse;
import com.fullstack.escape_rentals.user.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management")
public class UserController {

    private final UserService userService;

    @DeleteMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteMyAccount() {
        userService.deleteOwnAccount();
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("#id == authentication.principal.id")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id , @Valid @RequestBody UpdateUserRequest request){
        UserResponse response = userService.updateUser(id,request);
        return ResponseEntity.ok(response);
    }
}





















