package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.BillingCalculationRequest;
import com.infosys.water_management.dto.Response.BillingCalculationResponse;
import com.infosys.water_management.service.BillingEngineService;
import com.infosys.water_management.service.ConsumptionDistributionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.Map;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    private final BillingEngineService billingEngineService;
    private final ConsumptionDistributionService consumptionDistributionService;

    public BillingController(
            BillingEngineService billingEngineService,
            ConsumptionDistributionService consumptionDistributionService) {

        this.billingEngineService = billingEngineService;
        this.consumptionDistributionService =
                consumptionDistributionService;
    }

    @PostMapping("/calculate")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<BillingCalculationResponse> calculateBill(
            @Valid @RequestBody BillingCalculationRequest request) {

        return ResponseEntity.ok(
                billingEngineService.calculateBill(request)
        );
    }

    @PostMapping("/calculate-all")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<com.infosys.water_management.dto.Response.BulkBillingResponse> calculateAllPending(
            @RequestParam Long apartmentId,
            @RequestParam Integer billingMonth,
            @RequestParam Integer billingYear) {

        return ResponseEntity.ok(
                billingEngineService.calculateAllPending(apartmentId, billingMonth, billingYear)
        );
    }

    @PostMapping("/distribute")
        @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<Map<Long, Double>> distributeCost(
            @RequestParam Long apartmentId,
            @RequestParam Integer billingMonth,
            @RequestParam Integer billingYear) {

        Map<Long, Double> allocations =
                consumptionDistributionService.distributeCost(
                        apartmentId,
                        billingMonth,
                        billingYear
                );

        return ResponseEntity.ok(allocations);
    }
}