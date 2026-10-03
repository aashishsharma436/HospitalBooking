package com.hospitalbooking.platform;

public interface MailProvisioningService {
 MailboxResult createMailbox(String email,String temporaryPassword,String firstName,String lastName,String role);
 record MailboxResult(String provider,String providerAccountId,String status){}
}
