package com.hospitalbooking.platform;
import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface PlatformUserRepository extends JpaRepository<PlatformUser,UUID>{ Optional<PlatformUser> findByEmailIgnoreCase(String email); }