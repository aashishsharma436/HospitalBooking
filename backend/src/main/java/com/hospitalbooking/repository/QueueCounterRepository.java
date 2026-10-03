package com.hospitalbooking.repository;
import com.hospitalbooking.domain.QueueCounter;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.*;
import java.time.LocalDate;
import java.util.*;

public interface QueueCounterRepository extends JpaRepository<QueueCounter, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<QueueCounter> findByTenantIdAndDoctorPracticeIdAndQueueDate(
            UUID tenantId, UUID practiceId, LocalDate date);
}
