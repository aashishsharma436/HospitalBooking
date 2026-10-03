package com.hospitalbooking.repository;
import com.hospitalbooking.domain.Appointment;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {
    @Query("""
        select count(a) > 0 from Appointment a
        where a.tenantId = :tenantId
          and a.doctorPracticeId = :practiceId
          and a.appointmentDate = :date
          and a.status not in (com.hospitalbooking.domain.AppointmentStatus.CANCELLED,
                               com.hospitalbooking.domain.AppointmentStatus.NO_SHOW)
          and a.appointmentStart < :endTime
          and a.appointmentEnd > :startTime
    """)
    boolean existsOverlapping(@Param("tenantId") UUID tenantId,
                              @Param("practiceId") UUID practiceId,
                              @Param("date") LocalDate date,
                              @Param("startTime") LocalTime startTime,
                              @Param("endTime") LocalTime endTime);

    List<Appointment> findByTenantIdAndDoctorPracticeIdAndAppointmentDateOrderByAppointmentStart(
            UUID tenantId, UUID practiceId, LocalDate date);
}
