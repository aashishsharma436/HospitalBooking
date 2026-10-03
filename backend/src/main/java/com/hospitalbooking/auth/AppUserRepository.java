package com.hospitalbooking.auth;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface AppUserRepository extends JpaRepository<AppUser,UUID>{
 @Query(value="select u.* from users u where u.tenant_id=:tenantId and lower(u.email::text)=lower(:email) limit 1",nativeQuery=true)
 Optional<AppUser> findByTenantIdAndEmailIgnoreCase(@Param("tenantId") UUID tenantId,@Param("email") String email);
 @Query(value="select u.* from users u join user_hospitals uh on uh.user_id=u.id and uh.tenant_id=u.tenant_id join hospitals h on h.id=uh.hospital_id and h.tenant_id=uh.tenant_id where lower(u.email::text)=lower(:email) and lower(h.code)=lower(:hospitalCode) limit 1",nativeQuery=true)
 Optional<AppUser> findForHospital(@Param("email") String email,@Param("hospitalCode") String hospitalCode);
 @Query(value="select r.name from roles r join user_roles ur on ur.role_id=r.id where ur.user_id=:userId",nativeQuery=true)
 List<String> findRoleNames(@Param("userId") UUID userId);
 @Query(value="select h.id from user_hospitals uh join hospitals h on h.id=uh.hospital_id and h.tenant_id=uh.tenant_id where uh.user_id=:userId and h.tenant_id=:tenantId and lower(h.code)=lower(:hospitalCode)",nativeQuery=true)
 Optional<UUID> findHospitalId(@Param("userId") UUID userId,@Param("tenantId") UUID tenantId,@Param("hospitalCode") String hospitalCode);
}
