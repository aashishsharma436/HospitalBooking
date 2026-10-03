package com.hospitalbooking.service;

import com.hospitalbooking.domain.*;
import com.hospitalbooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class QueueService {
    private final DoctorPracticeRepository practices;
    private final QueueCounterRepository counters;
    private final QueueTicketRepository tickets;

    public QueueService(DoctorPracticeRepository practices, QueueCounterRepository counters, QueueTicketRepository tickets) {
        this.practices = practices;
        this.counters = counters;
        this.tickets = tickets;
    }

    @Transactional
    public QueueTicket issue(UUID tenantId, QueueTicket input) {
        DoctorPractice practice = practices.findByTenantIdAndId(tenantId, input.getDoctorPracticeId())
                .orElseThrow(() -> new IllegalArgumentException("Doctor practice not found"));

        if (!practice.isQueueEnabled()) {
            throw new IllegalStateException("Queue is disabled for this practice");
        }

        LocalDate date = input.getQueueDate();
        QueueCounter counter = counters.findByTenantIdAndDoctorPracticeIdAndQueueDate(
                tenantId, practice.getId(), date).orElseGet(() -> {
                    QueueCounter created = new QueueCounter();
                    created.setTenantId(tenantId);
                    created.setHospitalId(input.getHospitalId());
                    created.setDoctorPracticeId(practice.getId());
                    created.setQueueDate(date);
                    created.setNextNumber(1);
                    return counters.save(created);
                });

        int token = counter.getNextNumber();
        counter.setNextNumber(token + 1);
        counters.save(counter);

        input.setTenantId(tenantId);
        input.setTokenNumber(token);
        input.setStatus(QueueStatus.WAITING);
        return tickets.save(input);
    }

    @Transactional(readOnly = true)
    public List<QueueTicket> list(UUID tenantId, UUID practiceId, LocalDate date) {
        return tickets.findByTenantIdAndDoctorPracticeIdAndQueueDateOrderByTokenNumber(
                tenantId, practiceId, date);
    }
}
