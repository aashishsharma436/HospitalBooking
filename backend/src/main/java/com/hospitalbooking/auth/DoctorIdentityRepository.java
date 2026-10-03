package com.hospitalbooking.auth;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface DoctorIdentityRepository extends JpaRepository<com.hospitalbooking.domain.DoctorPractice,UUID>{
 @Query(value="select d.id from doctors d where d.tenant_id=:tenantId and d.user_id=:userId limit 1",nativeQuery=true)
 Optional<UUID> findDoctorId(@Param("tenantId") UUID tenantId,@Param("userId") UUID userId);
}
