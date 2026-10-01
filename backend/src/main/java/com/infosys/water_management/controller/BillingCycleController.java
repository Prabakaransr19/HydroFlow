package com.infosys.water_management.controller;

import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.service.BillingCycleService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/billing-cycles")
public class BillingCycleController {

    private final BillingCycleService billingCycleService;

    public BillingCycleController(
            BillingCycleService billingCycleService) {

        this.billingCycleService = billingCycleService;
    }

    @PostMapping
    public ResponseEntity<BillingCycle> createBillingCycle(
            @RequestParam Long householdId,
            @RequestParam Integer billingMonth,
            @RequestParam Integer billingYear,
            @RequestParam LocalDate dueDate) {

        BillingCycle billingCycle =
                billingCycleService.createBillingCycle(
                        householdId,
                        billingMonth,
                        billingYear,
                        dueDate
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(billingCycle);
    }

    @GetMapping
    public ResponseEntity<java.util.List<BillingCycle>> getBillingCycles(
            @RequestParam(required = false) Long apartmentId) {
        return ResponseEntity.ok(billingCycleService.getBillingCycles(apartmentId));
    }
}