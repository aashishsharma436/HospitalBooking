package com.hospitalbooking.service;

import com.hospitalbooking.domain.*;
import com.hospitalbooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class AppointmentService {
    private final AppointmentRepository appointments;
    private final DoctorPracticeRepository practices;

    public AppointmentService(AppointmentRepository appointments, DoctorPracticeRepository practices) {
        this.appointments = appointments;
        this.practices = practices;
    }

    @Transactional(readOnly = true)
    public List<Appointment> list(UUID tenantId, UUID practiceId, LocalDate date) {
        requirePractice(tenantId, practiceId);
        return appointments.findByTenantIdAndDoctorPracticeIdAndAppointmentDateOrderByAppointmentStart(
                tenantId, practiceId, date);
    }

    @Transactional
    public Appointment book(UUID tenantId, Appointment input) {
        DoctorPractice practice = requirePractice(tenantId, input.getDoctorPracticeId());
        if (!practice.isOnlineBookingEnabled() && "WEBSITE".equalsIgnoreCase(input.getBookingSource())) {
            throw new IllegalStateException("Online booking is disabled for this practice");
        }
        if (!input.getAppointmentStart().isBefore(input.getAppointmentEnd())) {
            throw new IllegalArgumentException("Appointment start must be before appointment end");
        }
        if (appointments.existsOverlapping(
                tenantId, input.getDoctorPracticeId(), input.getAppointmentDate(),
                input.getAppointmentStart(), input.getAppointmentEnd())) {
            throw new IllegalStateException("The requested appointment time is no longer available");
        }

        input.setTenantId(tenantId);
        input.setStatus(AppointmentStatus.CONFIRMED);
        if (input.getAppointmentNumber() == null || input.getAppointmentNumber().isBlank()) {
            input.setAppointmentNumber("APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return appointments.save(input);
    }

    private DoctorPractice requirePractice(UUID tenantId, UUID id) {
        return practices.findByTenantIdAndId(tenantId, id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor practice not found"));
    }
}
