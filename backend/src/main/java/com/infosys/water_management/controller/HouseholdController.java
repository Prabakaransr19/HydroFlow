package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.HouseholdRequest;
import com.infosys.water_management.dto.Request.MeterConfigRequest;
import com.infosys.water_management.dto.Request.ResidentAssignmentRequest;
import com.infosys.water_management.dto.Response.HouseholdResponse;
import com.infosys.water_management.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/households")
public class HouseholdController {

    private final HouseholdService householdService;

    public HouseholdController(HouseholdService householdService) {
        this.householdService = householdService;
    }

    @PostMapping
    public ResponseEntity<HouseholdResponse> createHousehold(
            @Valid @RequestBody HouseholdRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(householdService.createHousehold(request));
    }

    @GetMapping
    public ResponseEntity<List<HouseholdResponse>> getHouseholds(
            @RequestParam(required = false) Long apartmentId) {
        return ResponseEntity.ok(householdService.getHouseholds(apartmentId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HouseholdResponse> getHouseholdById(@PathVariable Long id) {
        return ResponseEntity.ok(householdService.getHouseholdById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HouseholdResponse> updateHousehold(
            @PathVariable Long id,
            @Valid @RequestBody HouseholdRequest request) {
        return ResponseEntity.ok(householdService.updateHousehold(id, request));
    }

    @PostMapping("/{id}/meter")
    public ResponseEntity<HouseholdResponse> configureMeter(
            @PathVariable Long id,
            @Valid @RequestBody MeterConfigRequest request) {
        return ResponseEntity.ok(householdService.configureMeter(id, request));
    }

    @PostMapping("/{id}/assign-resident")
    public ResponseEntity<HouseholdResponse> assignResident(
            @PathVariable Long id,
            @Valid @RequestBody ResidentAssignmentRequest request) {
        return ResponseEntity.ok(householdService.assignResident(id, request));
    }
}
