package com.hospitalbooking.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name="queue_tickets")
public class QueueTicket {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="tenant_id",nullable=false) private UUID tenantId;
    @Column(name="hospital_id",nullable=false) private UUID hospitalId;
    @Column(name="doctor_practice_id",nullable=false) private UUID doctorPracticeId;
    @Column(name="patient_id",nullable=false) private UUID patientId;
    @Column(name="appointment_id") private UUID appointmentId;
    @Column(name="queue_date",nullable=false) private LocalDate queueDate;
    @Column(name="token_number",nullable=false) private int tokenNumber;
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Enumerated(EnumType.STRING) @Column(nullable=false) private QueueTicketSource source;
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Enumerated(EnumType.STRING) @Column(nullable=false) private QueueStatus status=QueueStatus.WAITING;
    @Column(name="called_at") private Instant calledAt;
    @Column(name="served_at") private Instant servedAt;

    public UUID getId(){return id;}
    public UUID getTenantId(){return tenantId;} public void setTenantId(UUID v){tenantId=v;}
    public UUID getHospitalId(){return hospitalId;} public void setHospitalId(UUID v){hospitalId=v;}
    public UUID getDoctorPracticeId(){return doctorPracticeId;} public void setDoctorPracticeId(UUID v){doctorPracticeId=v;}
    public UUID getPatientId(){return patientId;} public void setPatientId(UUID v){patientId=v;}
    public UUID getAppointmentId(){return appointmentId;} public void setAppointmentId(UUID v){appointmentId=v;}
    public LocalDate getQueueDate(){return queueDate;} public void setQueueDate(LocalDate v){queueDate=v;}
    public int getTokenNumber(){return tokenNumber;} public void setTokenNumber(int v){tokenNumber=v;}
    public QueueTicketSource getSource(){return source;} public void setSource(QueueTicketSource v){source=v;}
    public QueueStatus getStatus(){return status;} public void setStatus(QueueStatus v){status=v;}
    public Instant getCalledAt(){return calledAt;} public void setCalledAt(Instant v){calledAt=v;}
    public Instant getServedAt(){return servedAt;} public void setServedAt(Instant v){servedAt=v;}
}
