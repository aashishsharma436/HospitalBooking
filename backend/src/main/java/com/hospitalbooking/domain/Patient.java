package com.hospitalbooking.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name="patients")
public class Patient {
    @Id @GeneratedValue(strategy=GenerationType.UUID)
    private UUID id;
    @Column(name="tenant_id", nullable=false) private UUID tenantId;
    @Column(name="hospital_id", nullable=false) private UUID hospitalId;
    @Column(name="patient_number", nullable=false) private String patientNumber;
    @Column(name="full_name", nullable=false) private String fullName;
    private String phone;
    @JdbcTypeCode(SqlTypes.OTHER) private String email;

    public UUID getId(){return id;}
    public UUID getTenantId(){return tenantId;}
    public void setTenantId(UUID v){tenantId=v;}
    public UUID getHospitalId(){return hospitalId;}
    public void setHospitalId(UUID v){hospitalId=v;}
    public String getPatientNumber(){return patientNumber;}
    public void setPatientNumber(String v){patientNumber=v;}
    public String getFullName(){return fullName;}
    public void setFullName(String v){fullName=v;}
    public String getPhone(){return phone;}
    public void setPhone(String v){phone=v;}
    public String getEmail(){return email;}
    public void setEmail(String v){email=v;}
}
