package com.hospitalbooking.platform;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

@Service
public class VerificationDeliveryService {
 private final RestClient http=RestClient.create();
 private final String resendKey,emailFrom,twilioSid,twilioToken,twilioFrom,twilioMessagingSid;

 public VerificationDeliveryService(
  @Value("${RESEND_API_KEY:}") String resendKey,
  @Value("${VERIFICATION_EMAIL_FROM:}") String emailFrom,
  @Value("${TWILIO_ACCOUNT_SID:}") String twilioSid,
  @Value("${TWILIO_AUTH_TOKEN:}") String twilioToken,
  @Value("${TWILIO_FROM_NUMBER:}") String twilioFrom,
  @Value("${TWILIO_MESSAGING_SERVICE_SID:}") String twilioMessagingSid){
  this.resendKey=resendKey;this.emailFrom=emailFrom;this.twilioSid=twilioSid;this.twilioToken=twilioToken;this.twilioFrom=twilioFrom;this.twilioMessagingSid=twilioMessagingSid;
 }

 public void sendEmailOtp(String to,String otp){
  if(resendKey.isBlank()||emailFrom.isBlank()) throw new IllegalStateException("Email verification delivery is not configured");
  http.post().uri("https://api.resend.com/emails")
   .contentType(MediaType.APPLICATION_JSON)
   .header(HttpHeaders.AUTHORIZATION,"Bearer "+resendKey)
   .body(Map.of("from",emailFrom,"to",new String[]{to},"subject","CareFlow hospital verification code","html","<p>Your CareFlow verification code is <strong>"+otp+"</strong>.</p><p>This code expires in 10 minutes.</p>"))
   .retrieve().toBodilessEntity();
 }

 public void sendSmsOtp(String to,String otp){
  if(twilioSid.isBlank()||twilioToken.isBlank()||(twilioFrom.isBlank()&&twilioMessagingSid.isBlank()))
   throw new IllegalStateException("Mobile verification delivery is not configured");
  String auth=Base64.getEncoder().encodeToString((twilioSid+":"+twilioToken).getBytes(StandardCharsets.UTF_8));
  var form=new LinkedMultiValueMap<String,String>();
  form.add("To",to);form.add("Body","Your CareFlow hospital verification code is "+otp+". It expires in 10 minutes.");
  if(!twilioMessagingSid.isBlank()) form.add("MessagingServiceSid",twilioMessagingSid); else form.add("From",twilioFrom);
  http.post().uri("https://api.twilio.com/2010-04-01/Accounts/"+twilioSid+"/Messages.json")
   .contentType(MediaType.APPLICATION_FORM_URLENCODED)
   .header(HttpHeaders.AUTHORIZATION,"Basic "+auth)
   .body(form).retrieve().toBodilessEntity();
 }
}
