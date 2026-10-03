package com.hospitalbooking.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.UUID;

public final class TenantAccess {
 private TenantAccess(){}
 public static Jwt jwt(Authentication a){if(!(a instanceof JwtAuthenticationToken t))throw new IllegalStateException("Hospital authentication required");return t.getToken();}
 public static UUID tenantId(Authentication a){return UUID.fromString(jwt(a).getClaimAsString("tenantId"));}
 public static UUID hospitalId(Authentication a){return UUID.fromString(jwt(a).getClaimAsString("hospitalId"));}
 public static UUID doctorId(Authentication a){String v=jwt(a).getClaimAsString("doctorId");return v==null?null:UUID.fromString(v);}
}
