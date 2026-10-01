package com.infosys.water_management.controller;

import com.infosys.water_management.model.WaterPurchase;
import com.infosys.water_management.service.WaterPurchaseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-purchases")
public class WaterPurchaseController {

    private final WaterPurchaseService waterPurchaseService;

    public WaterPurchaseController(
            WaterPurchaseService waterPurchaseService) {
        this.waterPurchaseService = waterPurchaseService;
    }

    @PostMapping
    public ResponseEntity<WaterPurchase> createPurchase(
            @RequestBody(required = false) Map<String, Object> payload,
            @RequestParam(required = false) Long apartmentId,
            @RequestParam(required = false) String purchaseType,
            @RequestParam(required = false) Double purchasedVolume,
            @RequestParam(required = false) Double unitCost,
            @RequestParam(required = false) LocalDate purchaseDate,
            @RequestParam(required = false) String supplier,
            @RequestParam(required = false) String remarks) {

        Long aptId = apartmentId;
        String type = purchaseType;
        Double volume = purchasedVolume;
        Double cost = unitCost;
        LocalDate pDate = purchaseDate;
        String supp = supplier;
        String rem = remarks;

        if (payload != null) {
            if (payload.containsKey("apartmentId") && payload.get("apartmentId") != null) {
                aptId = Long.parseLong(payload.get("apartmentId").toString());
            }
            if (payload.containsKey("purchaseType") && payload.get("purchaseType") != null) {
                type = payload.get("purchaseType").toString();
            }
            if (payload.containsKey("purchasedVolume") && payload.get("purchasedVolume") != null) {
                volume = Double.parseDouble(payload.get("purchasedVolume").toString());
            }
            if (payload.containsKey("unitCost") && payload.get("unitCost") != null) {
                cost = Double.parseDouble(payload.get("unitCost").toString());
            }
            if (payload.containsKey("purchaseDate") && payload.get("purchaseDate") != null) {
                pDate = LocalDate.parse(payload.get("purchaseDate").toString());
            }
            if (payload.containsKey("supplier") && payload.get("supplier") != null) {
                supp = payload.get("supplier").toString();
            }
            if (payload.containsKey("remarks") && payload.get("remarks") != null) {
                rem = payload.get("remarks").toString();
            }
        }

        if (aptId == null) aptId = 1L;
        if (type == null) type = "TANKER";
        if (volume == null) volume = 10000.0;
        if (cost == null) cost = 2.5;
        if (pDate == null) pDate = LocalDate.now();

        WaterPurchase purchase = waterPurchaseService.createPurchase(
                aptId,
                type,
                volume,
                cost,
                pDate,
                supp,
                rem
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(purchase);
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<List<WaterPurchase>> getApartmentPurchases(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                waterPurchaseService.getApartmentPurchases(apartmentId)
        );
    }

    @GetMapping({"/billing-cycle/{billingCycleId}", "/cycle/{billingCycleId}"})
    public ResponseEntity<List<WaterPurchase>> getBillingCyclePurchases(
            @PathVariable Long billingCycleId) {
        return ResponseEntity.ok(
                waterPurchaseService.getPurchasesForBillingCycle(billingCycleId)
        );
    }

    @GetMapping({"/total-cost", "/apartment/{apartmentId}/total-cost"})
    public ResponseEntity<Map<String, Object>> calculateTotalPurchaseCost(
            @PathVariable(required = false) Long apartmentId,
            @RequestParam(required = false) Long apartmentIdParam,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {

        Long targetAptId = apartmentId != null ? apartmentId : (apartmentIdParam != null ? apartmentIdParam : 1L);
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();

        double totalCost = waterPurchaseService.calculateTotalPurchaseCost(
                targetAptId,
                start,
                end
        );

        Map<String, Object> result = Map.of(
                "apartmentId", targetAptId,
                "totalCost", totalCost,
                "startDate", start,
                "endDate", end
        );

        return ResponseEntity.ok(result);
    }
}