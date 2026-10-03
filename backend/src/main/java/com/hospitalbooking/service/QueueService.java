package com.hospitalbooking.service;

import com.hospitalbooking.domain.*; import com.hospitalbooking.repository.*;
import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate; import java.util.*;

@Service
public class QueueService {
 private final DoctorPracticeRepository practices; private final QueueCounterRepository counters; private final QueueTicketRepository tickets; private final PatientRepository patients;
 public QueueService(DoctorPracticeRepository practices,QueueCounterRepository counters,QueueTicketRepository tickets,PatientRepository patients){this.practices=practices;this.counters=counters;this.tickets=tickets;this.patients=patients;}
 @Transactional public QueueTicket issue(UUID tenantId,UUID hospitalId,QueueTicket input){
  DoctorPractice practice=practices.findByTenantIdAndId(tenantId,input.getDoctorPracticeId()).filter(p->hospitalId.equals(p.getHospitalId())).orElseThrow(()->new IllegalArgumentException("Doctor practice not found"));
  if(!practice.isQueueEnabled()) throw new IllegalStateException("Queue is disabled for this practice");
  if(!patients.existsByIdAndTenantIdAndHospitalId(input.getPatientId(),tenantId,hospitalId)) throw new IllegalArgumentException("Patient is not part of this hospital");
  LocalDate date=input.getQueueDate();
  QueueCounter counter=counters.findByTenantIdAndDoctorPracticeIdAndQueueDate(tenantId,practice.getId(),date).orElseGet(()->{QueueCounter x=new QueueCounter();x.setTenantId(tenantId);x.setHospitalId(hospitalId);x.setDoctorPracticeId(practice.getId());x.setQueueDate(date);x.setNextNumber(1);return counters.save(x);});
  int token=counter.getNextNumber(); counter.setNextNumber(token+1); counters.save(counter);
  input.setTenantId(tenantId); input.setHospitalId(hospitalId); input.setTokenNumber(token); input.setStatus(QueueStatus.WAITING); return tickets.save(input);
 }
 @Transactional(readOnly=true) public List<QueueTicket> list(UUID tenantId,UUID hospitalId,UUID practiceId,LocalDate date){
  practices.findByTenantIdAndId(tenantId,practiceId).filter(p->hospitalId.equals(p.getHospitalId())).orElseThrow(()->new IllegalArgumentException("Doctor practice not found"));
  return tickets.findByTenantIdAndDoctorPracticeIdAndQueueDateOrderByTokenNumber(tenantId,practiceId,date);
 }
}
