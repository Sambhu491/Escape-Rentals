package com.fullstack.escape_rentals.user.dto.response;

import com.fullstack.escape_rentals.user.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;

    // Bug fix: this DTO never exposed the account's actual enabled/disabled
    // state, so the admin users table's "u.enabled === false ? Disabled :
    // Active" check always read undefined and showed every account as
    // Active regardless of real status.
    private boolean enabled;
    private LocalDateTime disabledUntil;
    private LocalDateTime createdAt;
}
