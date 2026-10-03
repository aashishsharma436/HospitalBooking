package com.hospitalbooking.platform;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1/platform")
public class PlatformAdminController {
 private final TenantRepository tenants; private final HospitalProvisioningService provisioning; private final JdbcTemplate jdbc; private final PlatformVerificationService verification;
 public PlatformAdminController(TenantRepository tenants,HospitalProvisioningService provisioning,JdbcTemplate jdbc,PlatformVerificationService verification){this.tenants=tenants;this.provisioning=provisioning;this.jdbc=jdbc;this.verification=verification;}

 @GetMapping("/tenants") public List<Tenant> tenants(){return tenants.findAll();}
 @GetMapping("/dashboard") public Map<String,Object> dashboard(){
  Map<String,Object> m=new LinkedHashMap<>();m.put("total",tenants.count());m.put("pending",tenants.countByStatus(HospitalStatus.PENDING_REVIEW));m.put("verifiedPendingReview",countStatus("VERIFIED_PENDING_REVIEW"));
  m.put("active",tenants.countByStatus(HospitalStatus.ACTIVE));m.put("trial",tenants.countByStatus(HospitalStatus.TRIAL));m.put("suspended",tenants.countByStatus(HospitalStatus.SUSPENDED));return m;
 }
 @PostMapping("/tenants") public Map<String,Object> onboard(@RequestBody Tenant request,Authentication auth){
  request.setStatus(HospitalStatus.PENDING_REVIEW);request.setOnboardingStatus(HospitalStatus.PENDING_REVIEW);
  if(request.getTenantSlug()==null||request.getTenantSlug().isBlank())request.setTenantSlug(slugify(request.getHospitalCode()));
  request.setTenantDomain(request.getTenantSlug()+".careflow.com");
  if(request.getAdminEmail()==null||request.getAdminEmail().isBlank())request.setAdminEmail("admin@"+request.getTenantDomain());
  if(request.getEmail()==null||request.getEmail().isBlank())throw new IllegalArgumentException("Verified contact email is required");
  if(request.getPhone()==null||request.getPhone().isBlank())throw new IllegalArgumentException("Mobile number is required");
  Tenant saved=tenants.save(request);
  audit(auth,"HOSPITAL_ONBOARDING_CREATED","PLATFORM_TENANT",saved.getId(),Map.of("hospitalCode",saved.getHospitalCode()));
  try{
   Map<String,Object> state=verification.send(saved.getId());
   audit(auth,"HOSPITAL_VERIFICATION_OTP_SENT","PLATFORM_TENANT",saved.getId(),Map.of("email",saved.getEmail(),"mobile",saved.getPhone()));
   return state;
  }catch(RuntimeException e){
   audit(auth,"HOSPITAL_VERIFICATION_DELIVERY_FAILED","PLATFORM_TENANT",saved.getId(),Map.of("error",e.getMessage()==null?"delivery failed":e.getMessage()));
   throw e;
  }
 }
 @PostMapping("/tenants/{id}/verification/send") public Map<String,Object> resend(@PathVariable UUID id,Authentication auth){
  Map<String,Object> state=verification.send(id);audit(auth,"HOSPITAL_VERIFICATION_OTP_SENT","PLATFORM_TENANT",id,Map.of());return state;
 }
 @PostMapping("/tenants/{id}/verification/email") public Map<String,Object> verifyEmail(@PathVariable UUID id,@RequestBody Map<String,String> body,Authentication auth){
  Map<String,Object> state=verification.verifyEmail(id,body.get("otp"));audit(auth,"HOSPITAL_EMAIL_VERIFIED","PLATFORM_TENANT",id,Map.of());return state;
 }
 @PostMapping("/tenants/{id}/verification/mobile") public Map<String,Object> verifyMobile(@PathVariable UUID id,@RequestBody Map<String,String> body,Authentication auth){
  Map<String,Object> state=verification.verifyMobile(id,body.get("otp"));audit(auth,"HOSPITAL_MOBILE_VERIFIED","PLATFORM_TENANT",id,Map.of());return state;
 }
 @PostMapping("/tenants/{id}/approve") public Map<String,Object> approve(@PathVariable UUID id,Authentication auth){
  Map<String,Object> v=jdbc.queryForMap("select email_verified,mobile_verified,status from platform_tenants where id=?",id);
  if(!Boolean.TRUE.equals(v.get("email_verified"))||!Boolean.TRUE.equals(v.get("mobile_verified"))||!"VERIFIED_PENDING_REVIEW".equals(v.get("status")))
   throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT,"Verify both email and mobile before approval");
  Tenant t=tenants.findById(id).orElseThrow();t.setStatus(HospitalStatus.PROVISIONING);t.setOnboardingStatus(HospitalStatus.PROVISIONING);t.setApprovedAt(Instant.now());tenants.save(t);
  HospitalProvisioningService.ProvisionedAdmin admin=provisioning.provision(id);
  audit(auth,"HOSPITAL_APPROVED","PLATFORM_TENANT",id,Map.of("adminEmail",admin.email()));
  return Map.of("tenant",tenants.findById(id).orElse(t),"adminEmail",admin.email(),"temporaryPassword",admin.temporaryPassword(),"message","Hospital provisioned");
 }
 @PostMapping("/tenants/{id}/reject") public Tenant reject(@PathVariable UUID id,Authentication auth){
  Tenant t=tenants.findById(id).orElseThrow();t.setStatus(HospitalStatus.REJECTED);t.setOnboardingStatus(HospitalStatus.REJECTED);Tenant saved=tenants.save(t);audit(auth,"HOSPITAL_REJECTED","PLATFORM_TENANT",id,Map.of());return saved;
 }
 @PostMapping("/tenants/{id}/activate") public Tenant activate(@PathVariable UUID id,Authentication auth){
  Tenant t=tenants.findById(id).orElseThrow();t.setStatus(HospitalStatus.ACTIVE);t.setOnboardingStatus(HospitalStatus.ACTIVE);
  if(t.getAdminUserId()!=null)jdbc.update("update users set status='ACTIVE',updated_at=now() where id=?",t.getAdminUserId());
  Tenant saved=tenants.save(t);audit(auth,"HOSPITAL_ACTIVATED","PLATFORM_TENANT",id,Map.of());return saved;
 }
 @GetMapping("/tenants/{id}") public Map<String,Object> hospital(@PathVariable UUID id){
  Map<String,Object> p=jdbc.queryForMap("select pt.id,pt.hospital_name,pt.hospital_code,pt.email,pt.phone,pt.city,pt.status,pt.onboarding_status,pt.tenant_domain,pt.admin_email,pt.email_verified,pt.mobile_verified,pt.created_at,pt.approved_at,pt.verified_at,pt.admin_user_id,t.id tenant_id,h.id hospital_id from platform_tenants pt left join tenants t on t.tenant_slug=pt.tenant_slug left join hospitals h on h.tenant_id=t.id and h.code=pt.hospital_code where pt.id=?",id);
  return p;
 }
 @GetMapping("/subscriptions") public List<Map<String,Object>> subscriptions(){
  return jdbc.queryForList("select s.id,t.name as hospital,p.name as plan,s.status,s.started_at,s.current_period_start,s.current_period_end,s.provider from subscriptions s join tenants t on t.id=s.tenant_id join plans p on p.id=s.plan_id order by s.created_at desc");
 }
 @GetMapping("/users") public List<Map<String,Object>> platformUsers(){
  return jdbc.queryForList("select id,email,role,active from platform_users order by email");
 }
 @GetMapping("/audit-logs") public List<Map<String,Object>> auditLogs(){
  return jdbc.queryForList("select id,tenant_id,hospital_id,user_id,action,entity_type,entity_id,ip_address::text ip_address,user_agent,metadata,created_at from audit_logs order by created_at desc limit 200");
 }
 private long countStatus(String status){Long n=jdbc.queryForObject("select count(*) from platform_tenants where status=?",Long.class,status);return n==null?0:n;}
 private void audit(Authentication auth,String action,String entityType,UUID entityId,Map<String,Object> metadata){
  String actor=auth==null?"system":auth.getName();
  jdbc.update("insert into audit_logs(action,entity_type,entity_id,metadata) values(?,?,?,?::jsonb)",action,entityType,entityId,new com.fasterxml.jackson.databind.ObjectMapper().valueToTree(Map.of("actor",actor,"source","platform")).toString());
 }
 private String slugify(String v){String s=v.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+","-").replaceAll("^-+|-+$","");return s.length()>60?s.substring(0,60):s;}
}
