package com.hospitalbooking.api;

import com.hospitalbooking.domain.QueueTicket;
import com.hospitalbooking.service.QueueService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1/queue")
public class QueueController {
    private final QueueService service;
    public QueueController(QueueService service) { this.service = service; }

    @PostMapping("/tickets")
    public QueueTicket issue(@RequestHeader("X-Tenant-Id") UUID tenantId, @Valid @RequestBody QueueTicket request) {
        return service.issue(tenantId, request);
    }

    @GetMapping("/tickets")
    public List<QueueTicket> list(
            @RequestHeader("X-Tenant-Id") UUID tenantId,
            @RequestParam UUID practiceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return service.list(tenantId, practiceId, date);
    }
}
