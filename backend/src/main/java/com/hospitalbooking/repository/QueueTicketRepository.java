package com.hospitalbooking.repository;
import com.hospitalbooking.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.*;

public interface QueueTicketRepository extends JpaRepository<QueueTicket, UUID> {
    List<QueueTicket> findByTenantIdAndDoctorPracticeIdAndQueueDateOrderByTokenNumber(
            UUID tenantId, UUID practiceId, LocalDate date);
}
