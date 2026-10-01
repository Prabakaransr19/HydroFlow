package com.infosys.water_management.controller;

import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.service.BillingCycleLifecycleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing-cycles")
public class BillingCycleLifecycleController {

    private final BillingCycleLifecycleService lifecycleService;

    public BillingCycleLifecycleController(
            BillingCycleLifecycleService lifecycleService) {

        this.lifecycleService = lifecycleService;
    }

    @PutMapping("/{billingCycleId}/finalize")
    public ResponseEntity<BillingCycle> finalizeBillingCycle(
            @PathVariable Long billingCycleId) {

        BillingCycle billingCycle =
                lifecycleService.finalizeBillingCycle(
                        billingCycleId
                );

        return ResponseEntity.ok(billingCycle);
    }

    @PutMapping("/{billingCycleId}/archive")
    public ResponseEntity<BillingCycle> archiveBillingCycle(
            @PathVariable Long billingCycleId) {

        BillingCycle billingCycle =
                lifecycleService.archiveBillingCycle(
                        billingCycleId
                );

        return ResponseEntity.ok(billingCycle);
    }
}