package com.fullstack.escape_rentals.auth.repository;

import com.fullstack.escape_rentals.auth.entity.PendingRegistrationEntity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PendingRegistrationRepository extends JpaRepository<PendingRegistrationEntity, Long> {

    Optional<PendingRegistrationEntity> findByEmail(String email);
    Optional<PendingRegistrationEntity> findByPhone(String phone);

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    void deleteByCreatedAtBefore(LocalDateTime cutoff);

    @Modifying
    @Query("""
        delete from PendingRegistrationEntity p where p.email = :email
    """)
    void deleteByEmail(String email);

    @Modifying
    @Transactional
    @Query("""
        delete from PendingRegistrationEntity p where p.phone = :phone
    """)
    void deleteByPhone(String phone);

}
