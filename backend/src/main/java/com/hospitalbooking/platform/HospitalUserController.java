package com.hospitalbooking.platform;

import com.hospitalbooking.security.TenantAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.security.SecureRandom;
import java.util.*;

@RestController
@RequestMapping("/api/v1/hospital/users")
public class HospitalUserController {
 private final JdbcTemplate jdbc; private final PasswordEncoder encoder; private final MailProvisioningService mail; private final SecureRandom random=new SecureRandom();
 public HospitalUserController(JdbcTemplate jdbc,PasswordEncoder encoder,MailProvisioningService mail){this.jdbc=jdbc;this.encoder=encoder;this.mail=mail;}

 @GetMapping public List<Map<String,Object>> list(Authentication auth){
  UUID tenantId=TenantAccess.tenantId(auth),hospitalId=TenantAccess.hospitalId(auth);
  return jdbc.queryForList("select u.id,u.full_name as \"fullName\",u.email::text as email,u.phone,r.name as role,u.status::text as status,coalesce(ea.status,'PENDING') as \"mailStatus\" from users u join user_hospitals uh on uh.user_id=u.id and uh.tenant_id=u.tenant_id join user_roles ur on ur.user_id=u.id join roles r on r.id=ur.role_id left join email_accounts ea on ea.user_id=u.id where u.tenant_id=? and uh.hospital_id=? order by u.full_name",tenantId,hospitalId);
 }

 @PostMapping public Map<String,Object> create(Authentication auth,@Valid @RequestBody CreateUserRequest req){
  UUID tenantId=TenantAccess.tenantId(auth),hospitalId=TenantAccess.hospitalId(auth);
  String prefix=req.emailPrefix().trim().toLowerCase(Locale.ROOT);
  if(!prefix.matches("[a-z0-9][a-z0-9._-]{1,63}")) throw new IllegalArgumentException("Email prefix must contain 2-64 lowercase letters, numbers, dot, underscore or hyphen");
  String domain=jdbc.queryForObject("select tenant_domain from tenants where id=?",String.class,tenantId);
  if(domain==null||domain.isBlank()) throw new IllegalStateException("Hospital email domain is not configured");
  String email=prefix+"@"+domain;
  if(jdbc.queryForObject("select count(*) from users where tenant_id=? and email=?::citext",Long.class,tenantId,email)>0) throw new IllegalArgumentException("That email prefix is already in use");
  if(!Set.of("RECEPTIONIST","DOCTOR","HOSPITAL_ADMIN").contains(req.role())) throw new IllegalArgumentException("Unsupported hospital role");

  UUID userId=UUID.randomUUID(); String appPassword=temporaryPassword(),mailPassword=temporaryPassword();
  jdbc.update("insert into users(id,tenant_id,email,phone,password_hash,full_name,status) values(?,?,?::citext,?,?,?,'INVITED')",
   userId,tenantId,email,req.phone(),encoder.encode(appPassword),req.fullName());
  UUID roleId=jdbc.queryForObject("select id from roles where name=?",UUID.class,req.role());
  jdbc.update("insert into user_roles(user_id,role_id) values(?,?)",userId,roleId);
  jdbc.update("insert into user_hospitals(tenant_id,user_id,hospital_id) values(?,?,?)",tenantId,userId,hospitalId);
  MailProvisioningService.MailboxResult mailbox=mail.createMailbox(email,mailPassword,firstName(req.fullName()),lastName(req.fullName()),req.role());
  jdbc.update("insert into email_accounts(tenant_id,hospital_id,user_id,local_part,email_address,provider,provider_account_id,status,recovery_email) values(?,?,?,?,?::citext,?,?,?,?,?::citext)",
   tenantId,hospitalId,userId,prefix,email,mailbox.provider(),mailbox.providerAccountId(),mailbox.status(),req.recoveryEmail());
  return Map.of("id",userId,"email",email,"role",req.role(),"status","INVITED","temporaryPassword",appPassword,"mailboxStatus",mailbox.status());
 }

 private String firstName(String name){String[] p=name.trim().split("\\s+");return p[0];}
 private String lastName(String name){String[] p=name.trim().split("\\s+");return p.length>1?p[p.length-1]:"";}
 private String temporaryPassword(){String chars="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";StringBuilder s=new StringBuilder(18);for(int i=0;i<18;i++)s.append(chars.charAt(random.nextInt(chars.length())));return s.toString();}

 public record CreateUserRequest(@NotBlank String fullName,@NotBlank @Pattern(regexp="[a-zA-Z0-9._-]{2,64}") String emailPrefix,
  @NotBlank String role,String phone,@Email String recoveryEmail){}
}
