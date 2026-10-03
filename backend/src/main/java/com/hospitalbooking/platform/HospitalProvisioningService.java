package com.hospitalbooking.platform;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.util.*;

@Service
public class HospitalProvisioningService {
 private final JdbcTemplate jdbc; private final PasswordEncoder encoder; private final MailProvisioningService mail; private final SecureRandom random=new SecureRandom();
 public HospitalProvisioningService(JdbcTemplate jdbc,PasswordEncoder encoder,MailProvisioningService mail){this.jdbc=jdbc;this.encoder=encoder;this.mail=mail;}

 @Transactional
 public ProvisionedAdmin provision(UUID platformTenantId){
  Map<String,Object> p=jdbc.queryForMap("select hospital_name,hospital_code,email,phone,city,tenant_slug,tenant_domain,admin_email from platform_tenants where id=?",platformTenantId);
  String name=(String)p.get("hospital_name"),code=(String)p.get("hospital_code"),contactEmail=(String)p.get("email");
  String slug=Objects.toString(p.get("tenant_slug"),""); if(slug.isBlank()) slug=slugify(code);
  String domain=Objects.toString(p.get("tenant_domain"),""); if(domain.isBlank()) domain=slug+".careflow.com";
  String adminEmail=Objects.toString(p.get("admin_email"),""); if(adminEmail.isBlank()) adminEmail="admin@"+domain;

  UUID tenantId=singleUuid("select id from tenants where slug::text=?",slug);
  if(tenantId==null){
   tenantId=UUID.randomUUID();
   jdbc.update("insert into tenants(id,name,slug,status,timezone,currency,tenant_domain,tenant_slug) values(?,?,?::citext,'ACTIVE','Asia/Kolkata','INR',?,?)",
    tenantId,name,slug,domain,slug);
  }
  UUID hospitalId=singleUuid("select id from hospitals where tenant_id=? and code=?",tenantId,code);
  if(hospitalId==null){
   hospitalId=UUID.randomUUID();
   jdbc.update("insert into hospitals(id,tenant_id,name,code,slug,city,phone,email,status,timezone) values(?,?,?,?,?::citext,?,?,?::citext,'ACTIVE','Asia/Kolkata')",
    hospitalId,tenantId,name,code,slug,(String)p.get("city"),(String)p.get("phone"),contactEmail);
  }

  UUID userId=singleUuid("select id from users where tenant_id=? and email=?::citext",tenantId,adminEmail);
  String appPassword=temporaryPassword();
  if(userId==null){
   userId=UUID.randomUUID();
   jdbc.update("insert into users(id,tenant_id,email,phone,password_hash,full_name,status) values(?,?,?::citext,?,?,?,'INVITED')",
    userId,tenantId,adminEmail,(String)p.get("phone"),encoder.encode(appPassword),name);
   UUID roleId=singleUuid("select id from roles where name='HOSPITAL_ADMIN'");
   jdbc.update("insert into user_roles(user_id,role_id) values(?,?) on conflict do nothing",userId,roleId);
   jdbc.update("insert into user_hospitals(tenant_id,user_id,hospital_id) values(?,?,?) on conflict do nothing",tenantId,userId,hospitalId);
   String mailPassword=temporaryPassword();
   MailProvisioningService.MailboxResult mailbox=mail.createMailbox(adminEmail,mailPassword,firstName(name),lastName(name),"HOSPITAL_ADMIN");
   jdbc.update("insert into email_accounts(tenant_id,hospital_id,user_id,local_part,email_address,provider,provider_account_id,status,recovery_email) values(?,?,?,?,?::citext,?,?,?,?,?::citext)",
    tenantId,hospitalId,userId,localPart(adminEmail),adminEmail,mailbox.provider(),mailbox.providerAccountId(),mailbox.status(),contactEmail);
  }
  jdbc.update("update tenants set tenant_domain=?,tenant_slug=?,updated_at=now() where id=?",domain,slug,tenantId);
  jdbc.update("update platform_tenants set tenant_slug=?,tenant_domain=?,admin_email=?,admin_user_id=?,status='PROVISIONING',onboarding_status='PROVISIONING',approved_at=coalesce(approved_at,now()) where id=?",
   slug,domain,adminEmail,userId,platformTenantId);
  return new ProvisionedAdmin(tenantId,hospitalId,userId,adminEmail,appPassword);
 }

 private UUID singleUuid(String sql,Object... args){List<UUID> ids=jdbc.query(sql,(rs,n)->(UUID)rs.getObject(1),args);return ids.isEmpty()?null:ids.get(0);}
 private String slugify(String v){String s=v.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+","-").replaceAll("^-+|-+$","");return s.length()>60?s.substring(0,60):s;}
 private String localPart(String email){return email.substring(0,email.indexOf('@'));}
 private String firstName(String name){String[] p=name.trim().split("\\s+");return p[0];}
 private String lastName(String name){String[] p=name.trim().split("\\s+");return p.length>1?p[p.length-1]:"";}
 private String temporaryPassword(){String chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";StringBuilder s=new StringBuilder(18);for(int i=0;i<18;i++)s.append(chars.charAt(random.nextInt(chars.length())));return s.toString();}
 public record ProvisionedAdmin(UUID tenantId,UUID hospitalId,UUID userId,String email,String temporaryPassword){}
}
