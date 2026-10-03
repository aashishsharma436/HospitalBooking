package com.hospitalbooking.platform;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.UUID;
public interface TenantRepository extends JpaRepository<Tenant,UUID>{ long countByStatus(HospitalStatus status); }