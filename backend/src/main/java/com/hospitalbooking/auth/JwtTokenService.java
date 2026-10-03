package com.hospitalbooking.auth;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import com.nimbusds.jose.jwk.*;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.time.Instant;
import java.util.*;

public class JwtTokenService {
 private final JwtEncoder encoder; private final JwtDecoder decoder; private final String issuer; private final long ttlSeconds;
 public JwtTokenService(String secret,String issuer,long ttlSeconds){
  if(secret==null||secret.length()<32) throw new IllegalStateException("JWT_SECRET must be at least 32 characters");
  this.issuer=issuer; this.ttlSeconds=ttlSeconds;
  SecretKey key=new SecretKeySpec(secret.getBytes(java.nio.charset.StandardCharsets.UTF_8),"HmacSHA256");
  OctetSequenceKey jwk=new OctetSequenceKey.Builder(key.getEncoded()).algorithm(com.nimbusds.jose.JWSAlgorithm.HS256).build();
  this.encoder=new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
  this.decoder=NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
 }
 public String issue(UUID userId,String email,UUID tenantId,UUID hospitalId,String role,UUID doctorId){
  Instant now=Instant.now();
  JwtClaimsSet.Builder claims=JwtClaimsSet.builder().issuer(issuer).issuedAt(now).expiresAt(now.plusSeconds(ttlSeconds))
   .subject(userId.toString()).claim("email",email).claim("tenantId",tenantId.toString()).claim("hospitalId",hospitalId.toString())
   .claim("role",role).claim("authorities",List.of("ROLE_"+role));
  if(doctorId!=null) claims.claim("doctorId",doctorId.toString());
  return encoder.encode(JwtEncoderParameters.from(claims.build())).getTokenValue();
 }
 public JwtDecoder decoder(){return decoder;}
}
