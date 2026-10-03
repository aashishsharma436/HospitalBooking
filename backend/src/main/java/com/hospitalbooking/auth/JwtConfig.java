package com.hospitalbooking.auth;

import org.springframework.context.annotation.*;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Configuration
public class JwtConfig {
 @Bean JwtTokenService jwtTokenService(org.springframework.core.env.Environment env){
  return new JwtTokenService(env.getProperty("JWT_SECRET"),env.getProperty("JWT_ISSUER","careflow"),Long.parseLong(env.getProperty("JWT_TTL_SECONDS","28800")));
 }
 @Bean JwtDecoder jwtDecoder(JwtTokenService service){return service.decoder();}
}
