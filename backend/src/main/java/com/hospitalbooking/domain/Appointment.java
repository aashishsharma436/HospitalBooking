package com.hospitalbooking.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="appointments")
public class Appointment {
    @Id @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(name="hospital_id", nullable=false) private UUID hospitalId;
    @Column(name="doctor_practice_id", nullable=false) private UUID doctorPracticeId;
    @Column(name="patient_id", nullable=false) private UUID patientId;
    @Column(name="service_id", nullable=false) private UUID serviceId;
    @Column(name="appointment_number", nullable=false) private String appointmentNumber;
    @Column(name="appointment_date", nullable=false) private LocalDate appointmentDate;
    @Column(name="appointment_start", nullable=false) private LocalTime appointmentStart;
    @Column(name="appointment_end", nullable=false) private LocalTime appointmentEnd;
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Enumerated(EnumType.STRING) @Column(nullable=false) private AppointmentStatus status=AppointmentStatus.CONFIRMED;
    @Column(name="booking_source", nullable=false) private String bookingSource;
    @Column(name="checked_in_at") private Instant checkedInAt;
    @Column(name="checked_in_by") private UUID checkedInBy;
    private String notes;

    public UUID getId(){return id;}
    public UUID getTenantId(){return tenantId;} public void setTenantId(UUID v){tenantId=v;}
    public UUID getHospitalId(){return hospitalId;} public void setHospitalId(UUID v){hospitalId=v;}
    public UUID getDoctorPracticeId(){return doctorPracticeId;} public void setDoctorPracticeId(UUID v){doctorPracticeId=v;}
    public UUID getPatientId(){return patientId;} public void setPatientId(UUID v){patientId=v;}
    public UUID getServiceId(){return serviceId;} public void setServiceId(UUID v){serviceId=v;}
    public String getAppointmentNumber(){return appointmentNumber;} public void setAppointmentNumber(String v){appointmentNumber=v;}
    public LocalDate getAppointmentDate(){return appointmentDate;} public void setAppointmentDate(LocalDate v){appointmentDate=v;}
    public LocalTime getAppointmentStart(){return appointmentStart;} public void setAppointmentStart(LocalTime v){appointmentStart=v;}
    public LocalTime getAppointmentEnd(){return appointmentEnd;} public void setAppointmentEnd(LocalTime v){appointmentEnd=v;}
    public AppointmentStatus getStatus(){return status;} public void setStatus(AppointmentStatus v){status=v;}
    public String getBookingSource(){return bookingSource;} public void setBookingSource(String v){bookingSource=v;}
    public Instant getCheckedInAt(){return checkedInAt;} public void setCheckedInAt(Instant v){checkedInAt=v;}
    public UUID getCheckedInBy(){return checkedInBy;} public void setCheckedInBy(UUID v){checkedInBy=v;}
    public String getNotes(){return notes;} public void setNotes(String v){notes=v;}
}
