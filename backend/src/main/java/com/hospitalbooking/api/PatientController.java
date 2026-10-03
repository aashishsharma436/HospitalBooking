package com.hospitalbooking.api;

import com.hospitalbooking.domain.*;
import com.hospitalbooking.security.TenantAccess;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/patients")
public class PatientController {
 private final PatientRepository patients;
 public PatientController(PatientRepository patients){this.patients=patients;}
 @GetMapping public List<Patient> list(Authentication a){
  UUID tenant=TenantAccess.tenantId(a), hospital=TenantAccess.hospitalId(a);
  if(a.getAuthorities().stream().anyMatch(x->x.getAuthority().equals("ROLE_DOCTOR"))){
   UUID doctor=TenantAccess.doctorId(a); if(doctor==null)throw new AccessDeniedException("Doctor profile required");
   return patients.findForDoctor(tenant,hospital,doctor);
  }
  if(a.getAuthorities().stream().anyMatch(x->Set.of("ROLE_HOSPITAL_ADMIN","ROLE_RECEPTIONIST").contains(x.getAuthority())))
   return patients.findByTenantIdAndHospitalIdOrderByFullName(tenant,hospital);
  throw new AccessDeniedException("Patient access denied");
 }
}
