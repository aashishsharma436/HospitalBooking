package com.hospitalbooking.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name="doctor_practices")
public class DoctorPractice {
    @Id @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(name="hospital_id", nullable=false) private UUID hospitalId;
    @Column(name="doctor_id", nullable=false) private UUID doctorId;
    @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Enumerated(EnumType.STRING) @Column(name="consultation_mode", nullable=false) private ConsultationMode consultationMode = ConsultationMode.APPOINTMENT;
    @Column(name="queue_enabled", nullable=false) private boolean queueEnabled;
    @Column(name="online_booking_enabled", nullable=false) private boolean onlineBookingEnabled = true;

    public UUID getId(){return id;}
    public UUID getTenantId(){return tenantId;}
    public void setTenantId(UUID v){tenantId=v;}
    public UUID getHospitalId(){return hospitalId;}
    public void setHospitalId(UUID v){hospitalId=v;}
    public UUID getDoctorId(){return doctorId;}
    public void setDoctorId(UUID v){doctorId=v;}
    public ConsultationMode getConsultationMode(){return consultationMode;}
    public void setConsultationMode(ConsultationMode v){consultationMode=v;}
    public boolean isQueueEnabled(){return queueEnabled;}
    public void setQueueEnabled(boolean v){queueEnabled=v;}
    public boolean isOnlineBookingEnabled(){return onlineBookingEnabled;}
    public void setOnlineBookingEnabled(boolean v){onlineBookingEnabled=v;}
}
