package com.hospitalbooking.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "service", "hospital-booking-backend",
                "status", "UP",
                "timestamp", Instant.now()
        );
    }
}
