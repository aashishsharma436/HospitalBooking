package com.hospitalbooking.platform;
import jakarta.persistence.*;
import java.time.Instant; import java.util.UUID;
@Entity @Table(name="tenants")
public class Tenant {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="hospital_name",nullable=false) private String hospitalName;
 @Column(name="hospital_code",nullable=false,unique=true) private String hospitalCode;
 @Column(nullable=false) private String email;
 private String phone; private String city;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private HospitalStatus status=HospitalStatus.PENDING_REVIEW;
 @Column(name="onboarding_status",nullable=false) private HospitalStatus onboardingStatus=HospitalStatus.PENDING_REVIEW;
 @Column(name="created_at",nullable=false) private Instant createdAt=Instant.now();
 @Column(name="approved_at") private Instant approvedAt;
 public UUID getId(){return id;} public String getHospitalName(){return hospitalName;} public void setHospitalName(String v){hospitalName=v;}
 public String getHospitalCode(){return hospitalCode;} public void setHospitalCode(String v){hospitalCode=v;}
 public String getEmail(){return email;} public void setEmail(String v){email=v;} public String getPhone(){return phone;} public void setPhone(String v){phone=v;}
 public String getCity(){return city;} public void setCity(String v){city=v;} public HospitalStatus getStatus(){return status;} public void setStatus(HospitalStatus v){status=v;}
 public HospitalStatus getOnboardingStatus(){return onboardingStatus;} public void setOnboardingStatus(HospitalStatus v){onboardingStatus=v;}
 public Instant getCreatedAt(){return createdAt;} public Instant getApprovedAt(){return approvedAt;} public void setApprovedAt(Instant v){approvedAt=v;}
}