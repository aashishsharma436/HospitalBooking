package com.hospitalbooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return PasswordEncoderFactories.createDelegatingPasswordEncoder();}

 @Bean UserDetailsService platformUsers(@Value("${PLATFORM_ADMIN_USERNAME:superadmin}") String username,@Value("${PLATFORM_ADMIN_PASSWORD:change-me}") String password){
  return new InMemoryUserDetailsManager(User.withUsername(username).password(passwordEncoder().encode(password)).roles("PLATFORM_ADMIN").build());
 }

 @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){
  var authorities=new JwtGrantedAuthoritiesConverter();
  authorities.setAuthoritiesClaimName("authorities");
  authorities.setAuthorityPrefix("");
  var converter=new JwtAuthenticationConverter();
  converter.setJwtGrantedAuthoritiesConverter(authorities);
  return converter;
 }

 @Bean org.springframework.security.web.SecurityFilterChain security(HttpSecurity http,JwtDecoder decoder,JwtAuthenticationConverter converter) throws Exception{
  http.csrf(csrf->csrf.disable())
   .authorizeHttpRequests(auth->auth
    .requestMatchers("/actuator/health","/api/v1/status","/api/v1/auth/login").permitAll()
    .requestMatchers("/api/v1/platform/**").hasRole("PLATFORM_ADMIN")
    .requestMatchers("/api/v1/patients/**").hasAnyRole("HOSPITAL_ADMIN","RECEPTIONIST","DOCTOR")
    .requestMatchers("/api/v1/appointments/**","/api/v1/queue/**").hasAnyRole("HOSPITAL_ADMIN","RECEPTIONIST","DOCTOR")
    .anyRequest().authenticated())
   .httpBasic(Customizer.withDefaults())
   .oauth2ResourceServer(oauth2->oauth2.jwt(jwt->jwt.decoder(decoder).jwtAuthenticationConverter(converter)));
  return http.build();
 }
}
