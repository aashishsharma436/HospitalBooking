package com.hospitalbooking.repository;
import com.hospitalbooking.domain.DoctorPractice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface DoctorPracticeRepository extends JpaRepository<DoctorPractice, UUID> {
    Optional<DoctorPractice> findByTenantIdAndId(UUID tenantId, UUID id);
}
