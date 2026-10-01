package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.WaterReadingRequest;
import com.infosys.water_management.dto.Response.CsvUploadResponse;
import com.infosys.water_management.dto.Response.WaterReadingResponse;
import com.infosys.water_management.service.WaterUsageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/water-usage")
public class WaterUsageController {

    private final WaterUsageService waterUsageService;

    public WaterUsageController(WaterUsageService waterUsageService) {
        this.waterUsageService = waterUsageService;
    }

    @PostMapping("/reading")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<WaterReadingResponse> submitManualReading(@Valid @RequestBody WaterReadingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(waterUsageService.submitManualReading(request));
    }

    @GetMapping("/readings")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<List<WaterReadingResponse>> getReadings(
            @RequestParam(required = false) Long householdId,
            @RequestParam(required = false) Long apartmentId) {
        if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            householdId = null;
            apartmentId = null;
            return ResponseEntity.ok(waterUsageService.getReadingsForResident(
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName()));
        }
        return ResponseEntity.ok(waterUsageService.getReadings(householdId, apartmentId));
    }

    @PostMapping("/upload-csv")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<CsvUploadResponse> uploadUsageCSV(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(waterUsageService.uploadUsageCSV(file));
    }
}
