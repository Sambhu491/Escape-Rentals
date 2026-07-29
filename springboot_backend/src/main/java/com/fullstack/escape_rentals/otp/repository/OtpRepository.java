package com.fullstack.escape_rentals.otp.repository;

import com.fullstack.escape_rentals.otp.entity.OtpEntity;
import com.fullstack.escape_rentals.otp.entity.OtpPurpose;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<OtpEntity,Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OtpEntity> findTopByEmailAndPurposeOrderByCreatedAtDesc(
            String email,
            OtpPurpose purpose
    );


    @Modifying
    void deleteByEmailAndPurpose(String email, OtpPurpose purpose);
}
