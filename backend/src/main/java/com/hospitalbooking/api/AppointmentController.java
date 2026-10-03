package com.hospitalbooking.api;

import com.hospitalbooking.domain.Appointment;
import com.hospitalbooking.security.TenantAccess;
import com.hospitalbooking.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/appointments")
public class AppointmentController {
 private final AppointmentService service;
 public AppointmentController(AppointmentService service){this.service=service;}
 @PostMapping public Appointment book(Authentication a,@Valid @RequestBody Appointment request){
  return service.book(TenantAccess.tenantId(a),TenantAccess.hospitalId(a),request);
 }
 @GetMapping public List<Appointment> list(Authentication a,@RequestParam UUID practiceId,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date){
  return service.list(TenantAccess.tenantId(a),TenantAccess.hospitalId(a),practiceId,date);
 }
}
