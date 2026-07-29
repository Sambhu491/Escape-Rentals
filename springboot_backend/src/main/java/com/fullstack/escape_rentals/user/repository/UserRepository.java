package com.fullstack.escape_rentals.user.repository;

import com.fullstack.escape_rentals.user.entity.Role;
import com.fullstack.escape_rentals.user.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity,Long> {
    Optional<UserEntity> findByEmailAndDeletedFalse(String email);
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    // Dashboard: admin user summaries (soft-delete aware)
    long countByDeletedFalse();
    long countByRoleAndDeletedFalse(Role role);

    List<UserEntity> findByRoleAndDeletedFalseAndEnabledTrue(Role role);
}
