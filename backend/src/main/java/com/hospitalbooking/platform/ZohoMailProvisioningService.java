package com.hospitalbooking.platform;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.Map;

@Service("zohoMailProvisioningService")
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name="MAIL_PROVIDER",havingValue="zoho")
public class ZohoMailProvisioningService implements MailProvisioningService {
 private final RestClient client;
 private final ObjectMapper mapper;
 private final String provider;
 private final String orgId;
 private final String token;

 public ZohoMailProvisioningService(RestClient.Builder builder,ObjectMapper mapper,
   @Value("${MAIL_PROVIDER:identity-only}") String provider,
   @Value("${ZOHO_MAIL_ORG_ID:}") String orgId,
   @Value("${ZOHO_MAIL_OAUTH_TOKEN:}") String token){
  this.client=builder.baseUrl("https://mail.zoho.com").build();
  this.mapper=mapper;this.provider=provider;this.orgId=orgId;this.token=token;
 }

 @Override public MailboxResult createMailbox(String email,String temporaryPassword,String firstName,String lastName,String role){
  if(!"zoho".equalsIgnoreCase(provider)) return new MailboxResult("identity-only",null,"PENDING_PROVIDER");
  if(orgId.isBlank()||token.isBlank()) throw new IllegalStateException("ZOHO_MAIL_ORG_ID and ZOHO_MAIL_OAUTH_TOKEN are required when MAIL_PROVIDER=zoho");
  String zohoRole="HOSPITAL_ADMIN".equals(role)?"admin":"member";
  Map<String,Object> body=Map.of("primaryEmailAddress",email,"password",temporaryPassword,"firstName",firstName,
   "lastName",lastName,"displayName",(firstName+" "+lastName).trim(),"role",zohoRole,"country","in",
   "language","En","timeZone","Asia/Kolkata","oneTimePassword",true);
  ResponseEntity<String> response=client.post().uri("/api/organization/{orgId}/accounts",orgId)
   .header("Authorization","Zoho-oauthtoken "+token).contentType(MediaType.APPLICATION_JSON)
   .accept(MediaType.APPLICATION_JSON).body(body).retrieve().toEntity(String.class);
  try{
   JsonNode root=mapper.readTree(response.getBody());
   JsonNode data=root.path("data");
   return new MailboxResult("zoho",data.path("accountId").asText(null),root.path("status").path("description").asText("Created"));
  }catch(Exception e){throw new IllegalStateException("Unable to parse Zoho Mail response",e);}
 }
}
