package com.hospitalbooking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

@Configuration
public class SecurityConfig {
 @Bean UserDetailsService platformUsers(
   @Value("${PLATFORM_ADMIN_USERNAME:superadmin}") String username,
   @Value("${PLATFORM_ADMIN_PASSWORD:change-me}") String password) {
   var encoder=PasswordEncoderFactories.createDelegatingPasswordEncoder();
   return new InMemoryUserDetailsManager(User.withUsername(username).password(encoder.encode(password)).roles("PLATFORM_ADMIN").build());
 }
 @Bean org.springframework.security.web.SecurityFilterChain security(HttpSecurity http) throws Exception {
   http.csrf(csrf->csrf.ignoringRequestMatchers("/api/**"))
     .authorizeHttpRequests(auth->auth.requestMatchers("/actuator/health","/api/v1/status").permitAll()
       .requestMatchers("/api/v1/platform/**").hasRole("PLATFORM_ADMIN").anyRequest().permitAll())
     .httpBasic(Customizer.withDefaults());
   return http.build();
 }
}