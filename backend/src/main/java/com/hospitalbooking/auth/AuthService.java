package com.hospitalbooking.auth;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class AuthService {
 private final AppUserRepository users; private final DoctorIdentityRepository doctors; private final PasswordEncoder encoder; private final JwtTokenService tokens;
 public AuthService(AppUserRepository users,DoctorIdentityRepository doctors,PasswordEncoder encoder,JwtTokenService tokens){this.users=users;this.doctors=doctors;this.encoder=encoder;this.tokens=tokens;}
 public Map<String,Object> login(String tenantIdText,String hospitalCode,String email,String password){
  UUID tenantId; try{tenantId=UUID.fromString(tenantIdText);}catch(Exception e){throw new IllegalArgumentException("Invalid tenantId");}
  AppUser user=users.findForHospital(tenantId,email,hospitalCode).orElseThrow(()->new IllegalArgumentException("Invalid credentials"));
  if(user.getStatus()!=UserStatus.ACTIVE||user.getPasswordHash()==null||!encoder.matches(password,user.getPasswordHash())) throw new IllegalArgumentException("Invalid credentials");
  String role=users.findRoleNames(user.getId()).stream().filter(r->Set.of("HOSPITAL_ADMIN","RECEPTIONIST","DOCTOR").contains(r)).findFirst().orElseThrow(()->new IllegalStateException("User has no hospital role"));
  UUID hospitalId=users.findHospitalId(user.getId(),tenantId,hospitalCode).orElseThrow(()->new IllegalArgumentException("User is not assigned to this hospital"));
  UUID doctorId="DOCTOR".equals(role)?doctors.findDoctorId(tenantId,user.getId()).orElseThrow(()->new IllegalStateException("Doctor profile is not linked to this user")):null;
  return Map.of("accessToken",tokens.issue(user.getId(),user.getEmail(),tenantId,hospitalId,role,doctorId),"userId",user.getId(),"email",user.getEmail(),"name",user.getFullName(),"role",role,"tenantId",tenantId,"hospitalId",hospitalId);
 }
}
