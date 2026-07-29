package com.fullstack.escape_rentals.security;

// Database-backed user authority loader

import com.fullstack.escape_rentals.user.entity.UserEntity;
import com.fullstack.escape_rentals.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) {
        UserEntity user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(()->new UsernameNotFoundException("User not found"));

        if(!user.isEnabled()
                && user.getDisabledUntil()!=null
                && LocalDateTime.now()
                .isAfter(user.getDisabledUntil())){


            user.setEnabled(true);
            user.setDisabledUntil(null);

            userRepository.save(user);

        }
        if(!user.isEnabled()) {

            throw new DisabledException(
                    "Account disabled by administrator"
            );
        }

        return new CustomUserDetails(user);
    }
}
