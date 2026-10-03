package com.hospitalbooking.platform;

import org.springframework.stereotype.Service;

@Service
public class NoopMailProvisioningService implements MailProvisioningService {
 @Override public MailboxResult createMailbox(String email,String temporaryPassword,String firstName,String lastName,String role){
  return new MailboxResult("UNCONFIGURED",null,"PENDING");
 }
}
