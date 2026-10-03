package com.hospitalbooking.domain;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface PatientRepository extends JpaRepository<Patient,UUID>{
 List<Patient> findByTenantIdAndHospitalIdOrderByFullName(UUID tenantId,UUID hospitalId);
 boolean existsByIdAndTenantIdAndHospitalId(UUID id,UUID tenantId,UUID hospitalId);
 @Query("select distinct p from Patient p where p.tenantId=:tenantId and p.hospitalId=:hospitalId and exists (select a.id from Appointment a join DoctorPractice dp on dp.id=a.doctorPracticeId where a.patientId=p.id and a.tenantId=:tenantId and a.hospitalId=:hospitalId and dp.tenantId=:tenantId and dp.hospitalId=:hospitalId and dp.doctorId=:doctorId) order by p.fullName")
 List<Patient> findForDoctor(@Param("tenantId") UUID tenantId,@Param("hospitalId") UUID hospitalId,@Param("doctorId") UUID doctorId);
}
