package com.hospitalbooking.service;

import com.hospitalbooking.domain.*;
import com.hospitalbooking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*; import java.util.*;

@Service
public class AppointmentService {
 private final AppointmentRepository appointments; private final DoctorPracticeRepository practices; private final PatientRepository patients;
 public AppointmentService(AppointmentRepository appointments,DoctorPracticeRepository practices,PatientRepository patients){this.appointments=appointments;this.practices=practices;this.patients=patients;}
 @Transactional(readOnly=true) public List<Appointment> list(UUID tenantId,UUID hospitalId,UUID practiceId,LocalDate date){
  requirePractice(tenantId,hospitalId,practiceId);
  return appointments.findByTenantIdAndDoctorPracticeIdAndAppointmentDateOrderByAppointmentStart(tenantId,practiceId,date);
 }
 @Transactional public Appointment book(UUID tenantId,UUID hospitalId,Appointment input){
  DoctorPractice practice=requirePractice(tenantId,hospitalId,input.getDoctorPracticeId());
  if(!practice.isOnlineBookingEnabled()&&"WEBSITE".equalsIgnoreCase(input.getBookingSource())) throw new IllegalStateException("Online booking is disabled for this practice");
  if(!input.getAppointmentStart().isBefore(input.getAppointmentEnd())) throw new IllegalArgumentException("Appointment start must be before appointment end");
  if(!patients.existsByIdAndTenantIdAndHospitalId(input.getPatientId(),tenantId,hospitalId)) throw new IllegalArgumentException("Patient is not part of this hospital");
  if(appointments.existsOverlapping(tenantId,input.getDoctorPracticeId(),input.getAppointmentDate(),input.getAppointmentStart(),input.getAppointmentEnd())) throw new IllegalStateException("The requested appointment time is no longer available");
  input.setTenantId(tenantId); input.setHospitalId(hospitalId); input.setStatus(AppointmentStatus.CONFIRMED);
  if(input.getAppointmentNumber()==null||input.getAppointmentNumber().isBlank()) input.setAppointmentNumber("APT-"+UUID.randomUUID().toString().substring(0,8).toUpperCase());
  return appointments.save(input);
 }
 private DoctorPractice requirePractice(UUID tenantId,UUID hospitalId,UUID id){
  return practices.findByTenantIdAndId(tenantId,id).filter(p->hospitalId.equals(p.getHospitalId())).orElseThrow(()->new IllegalArgumentException("Doctor practice not found"));
 }
}
