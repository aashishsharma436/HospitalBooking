package com.hospitalbooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;

@Configuration
public class SecurityConfig {
 @Bean PasswordEncoder passwordEncoder(){return PasswordEncoderFactories.createDelegatingPasswordEncoder();}
 @Bean org.springframework.security.oauth2.jwt.JwtDecoder jwtDecoder(com.hospitalbooking.auth.JwtTokenService service){return service.decoder();}

 @Bean UserDetailsService platformUsers(@Value("${PLATFORM_ADMIN_USERNAME:superadmin}") String username,@Value("${PLATFORM_ADMIN_PASSWORD:change-me}") String password){
  return new InMemoryUserDetailsManager(User.withUsername(username).password(passwordEncoder().encode(password)).roles("PLATFORM_ADMIN").build());
 }

 @Bean AuthenticationProvider platformAuthenticationProvider(UserDetailsService platformUsers, PasswordEncoder encoder){
  var provider=new DaoAuthenticationProvider(platformUsers);
  provider.setPasswordEncoder(encoder);
  return provider;
 }

 @Bean CorsConfigurationSource corsConfigurationSource(){
  var config=new CorsConfiguration();
  config.setAllowedOrigins(List.of("https://hospital-booking-frontend-nq7l.onrender.com"));
  config.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
  config.setAllowedHeaders(List.of("Authorization","Content-Type","Accept","Origin"));
  config.setMaxAge(3600L);
  var source=new UrlBasedCorsConfigurationSource();
  source.registerCorsConfiguration("/**",config);
  return source;
 }

 @Bean JwtAuthenticationConverter jwtAuthenticationConverter(){
  var authorities=new JwtGrantedAuthoritiesConverter();
  authorities.setAuthoritiesClaimName("authorities");
  authorities.setAuthorityPrefix("");
  var converter=new JwtAuthenticationConverter();
  converter.setJwtGrantedAuthoritiesConverter(authorities);
  return converter;
 }

 @Bean org.springframework.security.web.SecurityFilterChain security(HttpSecurity http,JwtDecoder decoder,JwtAuthenticationConverter converter,AuthenticationProvider platformAuthenticationProvider) throws Exception{
  http.csrf(csrf->csrf.disable())
   .cors(Customizer.withDefaults())
   .authenticationProvider(platformAuthenticationProvider)
   .authorizeHttpRequests(auth->auth
    .requestMatchers(org.springframework.http.HttpMethod.OPTIONS,"/**").permitAll()
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
