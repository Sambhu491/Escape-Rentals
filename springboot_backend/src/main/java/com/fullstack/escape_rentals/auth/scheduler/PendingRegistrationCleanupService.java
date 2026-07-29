package com.fullstack.escape_rentals.auth.scheduler;

import com.fullstack.escape_rentals.auth.repository.PendingRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PendingRegistrationCleanupService {

    private final PendingRegistrationRepository repository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanup(){
        LocalDateTime cutoff =
                LocalDateTime.now().minusHours(2);
        repository.deleteByCreatedAtBefore(cutoff);
    }
}
