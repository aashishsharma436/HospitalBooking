package com.hospitalbooking.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name="queue_counters")
public class QueueCounter {
    @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
    @Column(name="tenant_id",nullable=false) private UUID tenantId;
    @Column(name="hospital_id",nullable=false) private UUID hospitalId;
    @Column(name="doctor_practice_id",nullable=false) private UUID doctorPracticeId;
    @Column(name="queue_date",nullable=false) private LocalDate queueDate;
    @Column(name="next_number",nullable=false) private int nextNumber=1;

    public UUID getId(){return id;}
    public UUID getTenantId(){return tenantId;} public void setTenantId(UUID v){tenantId=v;}
    public UUID getHospitalId(){return hospitalId;} public void setHospitalId(UUID v){hospitalId=v;}
    public UUID getDoctorPracticeId(){return doctorPracticeId;} public void setDoctorPracticeId(UUID v){doctorPracticeId=v;}
    public LocalDate getQueueDate(){return queueDate;} public void setQueueDate(LocalDate v){queueDate=v;}
    public int getNextNumber(){return nextNumber;} public void setNextNumber(int v){nextNumber=v;}
}
