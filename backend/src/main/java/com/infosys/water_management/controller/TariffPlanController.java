package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.TariffPlanRequest;
import com.infosys.water_management.dto.Response.TariffPlanResponse;
import com.infosys.water_management.service.TariffPlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tariff-plans")
public class TariffPlanController {

    private final TariffPlanService tariffPlanService;

    public TariffPlanController(TariffPlanService tariffPlanService) {
        this.tariffPlanService = tariffPlanService;
    }

    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<TariffPlanResponse> getTariffPlan(@PathVariable Long apartmentId) {
        return ResponseEntity.ok(tariffPlanService.getTariffPlanByApartmentId(apartmentId));
    }

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<TariffPlanResponse> saveOrUpdateTariffPlan(@Valid @RequestBody TariffPlanRequest request) {
        return ResponseEntity.ok(tariffPlanService.saveOrUpdateTariffPlan(request));
    }
}
