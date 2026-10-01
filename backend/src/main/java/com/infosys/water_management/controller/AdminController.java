package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Response.UserResponse;
import com.infosys.water_management.model.BillingCycleStatus;
import com.infosys.water_management.model.Role;
import com.infosys.water_management.model.Status;
import com.infosys.water_management.dto.Request.RegisterRequest;
import com.infosys.water_management.repository.*;
import com.infosys.water_management.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AuthService authService;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;
    private final WaterUsageRepository waterUsageRepository;

    public AdminController(
            AuthService authService,
            ApartmentRepository apartmentRepository,
            UserRepository userRepository,
            BillingCycleRepository billingCycleRepository,
            WaterPurchaseRepository waterPurchaseRepository,
            WaterUsageRepository waterUsageRepository) {
        this.authService = authService;
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.waterPurchaseRepository = waterPurchaseRepository;
        this.waterUsageRepository = waterUsageRepository;
    }

        @PostMapping("/super-admins")
        public ResponseEntity<UserResponse> createSuperAdmin(@RequestBody RegisterRequest request) {
                return ResponseEntity.status(201).body(authService.createSuperAdmin(request));
        }

    @GetMapping("/pending-community-admins")
    public ResponseEntity<List<UserResponse>> getPendingCommunityAdmins() {
        return ResponseEntity.ok(
                authService.getPendingCommunityAdmins()
        );
    }

    @GetMapping("/community-admins")
    public ResponseEntity<List<UserResponse>> getAllCommunityAdmins() {
        return ResponseEntity.ok(
                authService.getAllCommunityAdmins()
        );
    }

    @PutMapping("/approve/{id}")
    public ResponseEntity<UserResponse> approveCommunityAdmin(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                authService.approveCommunityAdmin(id)
        );
    }

    @PutMapping("/reject/{id}")
    public ResponseEntity<UserResponse> rejectCommunityAdmin(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                authService.rejectCommunityAdmin(id)
        );
    }

    @PutMapping("/community-admin/{adminId}/assign-apartment/{apartmentId}")
    public ResponseEntity<UserResponse> assignApartmentToAdmin(
            @PathVariable Long adminId,
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                authService.assignApartmentToAdmin(adminId, apartmentId)
        );
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();

        long totalApartments = apartmentRepository.count();
        long totalResidents = userRepository.countByRole(Role.RESIDENT);
        long pendingApprovals = userRepository.countByRoleAndStatus(Role.COMMUNITY_ADMIN, Status.PENDING);
        long activeBillingCycles = billingCycleRepository.countByStatus(BillingCycleStatus.OPEN);

        double totalWaterConsumption = waterUsageRepository.findAll()
                .stream()
                .mapToDouble(u -> u.getWaterConsumed() != null ? u.getWaterConsumed() : 0.0)
                .sum();

        double totalPurchaseCost = waterPurchaseRepository.findAll()
                .stream()
                .mapToDouble(p -> p.getTotalCost() != null ? p.getTotalCost() : 0.0)
                .sum();

        stats.put("totalApartments", totalApartments);
        stats.put("totalResidents", totalResidents);
        stats.put("pendingAdminsCount", pendingApprovals);
        stats.put("activeBillingCycles", activeBillingCycles);
        stats.put("totalConsumption", totalWaterConsumption);
        stats.put("totalPurchaseCost", totalPurchaseCost);

        return ResponseEntity.ok(stats);
    }
}