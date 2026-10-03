package com.hospitalbooking.platform;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformAdminController {
 private final TenantRepository tenants; private final HospitalProvisioningService provisioning; private final JdbcTemplate jdbc;
 public PlatformAdminController(TenantRepository tenants,HospitalProvisioningService provisioning,JdbcTemplate jdbc){this.tenants=tenants;this.provisioning=provisioning;this.jdbc=jdbc;}

 @GetMapping("/tenants") public List<Tenant> tenants(){return tenants.findAll();}
 @GetMapping("/dashboard") public Map<String,Object> dashboard(){
  Map<String,Object> m=new LinkedHashMap<>();m.put("total",tenants.count());m.put("pending",tenants.countByStatus(HospitalStatus.PENDING_REVIEW));
  m.put("active",tenants.countByStatus(HospitalStatus.ACTIVE));m.put("trial",tenants.countByStatus(HospitalStatus.TRIAL));m.put("suspended",tenants.countByStatus(HospitalStatus.SUSPENDED));return m;
 }
 @PostMapping("/tenants") public Tenant onboard(@RequestBody Tenant request){
  request.setStatus(HospitalStatus.PENDING_REVIEW);request.setOnboardingStatus(HospitalStatus.PENDING_REVIEW);
  if(request.getTenantSlug()==null||request.getTenantSlug().isBlank())request.setTenantSlug(slugify(request.getHospitalCode()));
  request.setTenantDomain(request.getTenantSlug()+".careflow.com");
  if(request.getAdminEmail()==null||request.getAdminEmail().isBlank())request.setAdminEmail("admin@"+request.getTenantDomain());
  return tenants.save(request);
 }
 @PostMapping("/tenants/{id}/approve") public Map<String,Object> approve(@PathVariable UUID id){
  Tenant t=tenants.findById(id).orElseThrow();t.setStatus(HospitalStatus.PROVISIONING);t.setOnboardingStatus(HospitalStatus.PROVISIONING);t.setApprovedAt(Instant.now());tenants.save(t);
  HospitalProvisioningService.ProvisionedAdmin admin=provisioning.provision(id);
  return Map.of("tenant",tenants.findById(id).orElse(t),"adminEmail",admin.email(),"temporaryPassword",admin.temporaryPassword(),"message","Hospital provisioned");
 }
 @PostMapping("/tenants/{id}/activate") public Tenant activate(@PathVariable UUID id){
  Tenant t=tenants.findById(id).orElseThrow();t.setStatus(HospitalStatus.ACTIVE);t.setOnboardingStatus(HospitalStatus.ACTIVE);
  if(t.getAdminUserId()!=null)jdbc.update("update users set status='ACTIVE',updated_at=now() where id=?",t.getAdminUserId());
  return tenants.save(t);
 }
 private String slugify(String v){String s=v.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+","-").replaceAll("^-+|-+$","");return s.length()>60?s.substring(0,60):s;}
}
