package com.hospitalbooking.auth;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface AppUserRepository extends JpaRepository<AppUser,UUID>{
 Optional<AppUser> findByTenantIdAndEmailIgnoreCase(UUID tenantId,String email);
 @Query(value="select u.* from users u join user_hospitals uh on uh.user_id=u.id and uh.tenant_id=u.tenant_id join hospitals h on h.id=uh.hospital_id and h.tenant_id=uh.tenant_id where u.tenant_id=:tenantId and lower(u.email)=lower(:email) and lower(h.code)=lower(:hospitalCode) limit 1",nativeQuery=true)
 Optional<AppUser> findForHospital(@org.springframework.data.repository.query.Param("tenantId") UUID tenantId,@org.springframework.data.repository.query.Param("email") String email,@org.springframework.data.repository.query.Param("hospitalCode") String hospitalCode);
 @Query(value="select r.name from roles r join user_roles ur on ur.role_id=r.id where ur.user_id=:userId",nativeQuery=true)
 List<String> findRoleNames(@Param("userId") UUID userId);
 @Query(value="select h.id from user_hospitals uh join hospitals h on h.id=uh.hospital_id and h.tenant_id=uh.tenant_id where uh.user_id=:userId and h.tenant_id=:tenantId and lower(h.code)=lower(:hospitalCode)",nativeQuery=true)
 Optional<UUID> findHospitalId(@Param("userId") UUID userId,@Param("tenantId") UUID tenantId,@Param("hospitalCode") String hospitalCode);
}
