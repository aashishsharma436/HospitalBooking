package com.hospitalbooking.auth;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Component
public class JwtTokenService {
 private final JwtDecoder decoder; private final byte[] secret; private final String issuer; private final long ttlSeconds; private final ObjectMapper mapper=new ObjectMapper();
 public JwtTokenService(org.springframework.core.env.Environment env){
  String configured=env.getProperty("JWT_SECRET");
  if(configured==null||configured.length()<32) throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
  secret=configured.getBytes(StandardCharsets.UTF_8); issuer=env.getProperty("JWT_ISSUER","careflow"); ttlSeconds=Long.parseLong(env.getProperty("JWT_TTL_SECONDS","28800"));
  decoder=NimbusJwtDecoder.withSecretKey(new SecretKeySpec(secret,"HmacSHA256")).macAlgorithm(MacAlgorithm.HS256).build();
 }
 public String issue(UUID userId,String email,UUID tenantId,UUID hospitalId,String role,UUID doctorId){
  try{
   Instant now=Instant.now();
   Map<String,Object> header=Map.of("alg","HS256","typ","JWT");
   Map<String,Object> claims=new LinkedHashMap<>();
   claims.put("iss",issuer); claims.put("iat",now.getEpochSecond()); claims.put("exp",now.plusSeconds(ttlSeconds).getEpochSecond());
   claims.put("sub",userId.toString()); claims.put("email",email); claims.put("tenantId",tenantId.toString()); claims.put("hospitalId",hospitalId.toString());
   claims.put("role",role); claims.put("authorities",List.of("ROLE_"+role)); if(doctorId!=null) claims.put("doctorId",doctorId.toString());
   String h=Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(header));
   String p=Base64.getUrlEncoder().withoutPadding().encodeToString(mapper.writeValueAsBytes(claims));
   Mac mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret,"HmacSHA256"));
   String s=Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal((h+"."+p).getBytes(StandardCharsets.US_ASCII)));
   return h+"."+p+"."+s;
  }catch(Exception e){throw new IllegalStateException("Unable to issue access token",e);}
 }
 public JwtDecoder decoder(){return decoder;}
}
