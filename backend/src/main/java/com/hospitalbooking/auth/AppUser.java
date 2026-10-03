package com.hospitalbooking.auth;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name="users")
public class AppUser {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(name="tenant_id",nullable=false) private UUID tenantId;
 @Column(nullable=false) private String email;
 private String phone;
 @Column(name="password_hash") private String passwordHash;
 @Column(name="full_name",nullable=false) private String fullName;
 @JdbcTypeCode(SqlTypes.NAMED_ENUM) @Enumerated(EnumType.STRING) @Column(nullable=false) private UserStatus status=UserStatus.INVITED;
 public UUID getId(){return id;} public UUID getTenantId(){return tenantId;} public String getEmail(){return email;}
 public String getPasswordHash(){return passwordHash;} public String getFullName(){return fullName;} public UserStatus getStatus(){return status;}
}
enum UserStatus { INVITED, ACTIVE, LOCKED, DISABLED }
