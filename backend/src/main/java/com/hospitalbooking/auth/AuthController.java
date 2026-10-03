package com.hospitalbooking.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
 private final AuthService auth;
 public AuthController(AuthService auth){this.auth=auth;}
 @PostMapping("/login") public Map<String,Object> login(@Valid @RequestBody LoginRequest r){return auth.login(r.hospitalCode(),r.email(),r.password());}
 public record LoginRequest(@NotBlank String hospitalCode,@Email @NotBlank String email,@NotBlank String password){}
}
