package com.hospitalbooking.platform;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="platform_users")
public class PlatformUser {
 @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
 @Column(nullable=false,unique=true) private String email;
 @Column(name="password_hash",nullable=false) private String passwordHash;
 @Enumerated(EnumType.STRING) @Column(nullable=false) private PlatformRole role=PlatformRole.SUPER_ADMIN;
 @Column(nullable=false) private boolean active=true;
 public UUID getId(){return id;} public String getEmail(){return email;} public void setEmail(String v){email=v;}
 public String getPasswordHash(){return passwordHash;} public void setPasswordHash(String v){passwordHash=v;}
 public PlatformRole getRole(){return role;} public void setRole(PlatformRole v){role=v;}
 public boolean isActive(){return active;} public void setActive(boolean v){active=v;}
}