package com.hospitalbooking.platform;
import org.springframework.web.bind.annotation.*; import java.time.Instant; import java.util.*;
@RestController @RequestMapping("/api/v1/platform")
public class PlatformAdminController {
 private final TenantRepository tenants;
 public PlatformAdminController(TenantRepository tenants){this.tenants=tenants;}
 @GetMapping("/tenants") public List<Tenant> tenants(){return tenants.findAll();}
 @GetMapping("/dashboard") public Map<String,Object> dashboard(){
  Map<String,Object> m=new LinkedHashMap<>(); m.put("total",tenants.count()); m.put("pending",tenants.countByStatus(HospitalStatus.PENDING_REVIEW));
  m.put("active",tenants.countByStatus(HospitalStatus.ACTIVE)); m.put("trial",tenants.countByStatus(HospitalStatus.TRIAL));
  m.put("suspended",tenants.countByStatus(HospitalStatus.SUSPENDED)); return m;
 }
 @PostMapping("/tenants") public Tenant onboard(@RequestBody Tenant request){
  request.setStatus(HospitalStatus.PENDING_REVIEW); request.setOnboardingStatus(HospitalStatus.PENDING_REVIEW); return tenants.save(request);
 }
 @PostMapping("/tenants/{id}/approve") public Tenant approve(@PathVariable UUID id){
  Tenant t=tenants.findById(id).orElseThrow(); t.setStatus(HospitalStatus.PROVISIONING); t.setOnboardingStatus(HospitalStatus.PROVISIONING); t.setApprovedAt(Instant.now()); return tenants.save(t);
 }
 @PostMapping("/tenants/{id}/activate") public Tenant activate(@PathVariable UUID id){
  Tenant t=tenants.findById(id).orElseThrow(); t.setStatus(HospitalStatus.ACTIVE); t.setOnboardingStatus(HospitalStatus.ACTIVE); return tenants.save(t);
 }
}