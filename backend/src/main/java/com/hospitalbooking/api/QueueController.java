package com.hospitalbooking.api;

import com.hospitalbooking.domain.QueueTicket;
import com.hospitalbooking.security.TenantAccess;
import com.hospitalbooking.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate; import java.util.*;

@RestController
@RequestMapping("/api/v1/queue")
public class QueueController {
 private final QueueService service;
 public QueueController(QueueService service){this.service=service;}
 @PostMapping("/tickets") public QueueTicket issue(Authentication a,@Valid @RequestBody QueueTicket request){return service.issue(TenantAccess.tenantId(a),TenantAccess.hospitalId(a),request);}
 @GetMapping("/tickets") public List<QueueTicket> list(Authentication a,@RequestParam UUID practiceId,@RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate date){return service.list(TenantAccess.tenantId(a),TenantAccess.hospitalId(a),practiceId,date);}
}
