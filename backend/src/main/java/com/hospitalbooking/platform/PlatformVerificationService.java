package com.hospitalbooking.platform;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PlatformVerificationService {
 private final JdbcTemplate jdbc; private final SecureRandom random=new SecureRandom(); private final VerificationDeliveryService delivery; private final int ttlMinutes;
 public PlatformVerificationService(JdbcTemplate jdbc,VerificationDeliveryService delivery,@Value("${PLATFORM_OTP_TTL_MINUTES:10}") int ttlMinutes){this.jdbc=jdbc;this.delivery=delivery;this.ttlMinutes=ttlMinutes;}
 public Map<String,Object> send(UUID id){
  Map<String,Object> t=jdbc.queryForMap("select email,phone,email_verified,mobile_verified,email_otp_sent_at,mobile_otp_sent_at from platform_tenants where id=?",id);
  String email=(String)t.get("email"),phone=(String)t.get("phone"); Instant now=Instant.now();
  if(Boolean.TRUE.equals(t.get("email_verified"))&&Boolean.TRUE.equals(t.get("mobile_verified"))) return state(id);
  if(!Boolean.TRUE.equals(t.get("email_verified"))){
   Instant last=asInstant(t.get("email_otp_sent_at")); if(last!=null&&last.plusSeconds(60).isAfter(now)) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Email OTP was sent recently. Try again in a moment.");
   String otp=otp(); jdbc.update("update platform_tenants set email_otp_hash=?,email_otp_expires_at=?,email_otp_sent_at=?,email_verification_attempts=0 where id=?",hash(otp),now.plus(ttlMinutes,ChronoUnit.MINUTES),now,id); delivery.sendEmailOtp(email,otp);
  }
  if(phone!=null&&!phone.isBlank()&&!Boolean.TRUE.equals(t.get("mobile_verified"))){
   Instant last=asInstant(t.get("mobile_otp_sent_at")); if(last!=null&&last.plusSeconds(60).isAfter(now)) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Mobile OTP was sent recently. Try again in a moment.");
   String otp=otp(); jdbc.update("update platform_tenants set mobile_otp_hash=?,mobile_otp_expires_at=?,mobile_otp_sent_at=?,mobile_verification_attempts=0 where id=?",hash(otp),now.plus(ttlMinutes,ChronoUnit.MINUTES),now,id); delivery.sendSmsOtp(phone,otp);
  }
  return state(id);
 }
 public Map<String,Object> verifyEmail(UUID id,String otp){verify(id,otp,true);return state(id);}
 public Map<String,Object> verifyMobile(UUID id,String otp){verify(id,otp,false);return state(id);}
 private void verify(UUID id,String otp,boolean email){
  if(otp==null||!otp.matches("\\d{6}")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"OTP must be 6 digits");
  String hash=hash(otp),hashColumn=email?"email_otp_hash":"mobile_otp_hash",expiresColumn=email?"email_otp_expires_at":"mobile_otp_expires_at",verifiedColumn=email?"email_verified":"mobile_verified",attemptsColumn=email?"email_verification_attempts":"mobile_verification_attempts";
  Map<String,Object> row=jdbc.queryForMap("select "+hashColumn+" otp_hash,"+expiresColumn+" expires_at,"+attemptsColumn+" attempts,"+verifiedColumn+" verified from platform_tenants where id=?",id);
  if(Boolean.TRUE.equals(row.get("verified"))) return;
  int attempts=((Number)row.get("attempts")).intValue(); if(attempts>=5) throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Too many invalid OTP attempts. Request a new OTP.");
  Instant expires=asInstant(row.get("expires_at")); if(expires==null||expires.isBefore(Instant.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"OTP has expired. Request a new OTP.");
  if(!hash.equals(row.get("otp_hash"))){jdbc.update("update platform_tenants set "+attemptsColumn+"="+attemptsColumn+"+1 where id=?",id);throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid OTP");}
  jdbc.update("update platform_tenants set "+verifiedColumn+"=true,"+hashColumn+"=null,"+expiresColumn+"=null,"+attemptsColumn+"=0 where id=?",id);
  Map<String,Object> s=jdbc.queryForMap("select email_verified,mobile_verified from platform_tenants where id=?",id);
  if(Boolean.TRUE.equals(s.get("email_verified"))&&Boolean.TRUE.equals(s.get("mobile_verified"))) jdbc.update("update platform_tenants set status='VERIFIED_PENDING_REVIEW',onboarding_status='VERIFIED_PENDING_REVIEW',verified_at=now() where id=?",id);
 }
 private Map<String,Object> state(UUID id){return jdbc.queryForMap("select id,hospital_name,status,onboarding_status,email,email_verified,mobile_verified,phone,verified_at from platform_tenants where id=?",id);}
 private Instant asInstant(Object value){if(value==null)return null;if(value instanceof Instant i)return i;if(value instanceof java.time.OffsetDateTime o)return o.toInstant();if(value instanceof java.sql.Timestamp t)return t.toInstant();return Instant.parse(value.toString());}
 private String otp(){return String.format(Locale.ROOT,"%06d",random.nextInt(1_000_000));}
 private String hash(String value){try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException("Unable to hash OTP",e);}}
}