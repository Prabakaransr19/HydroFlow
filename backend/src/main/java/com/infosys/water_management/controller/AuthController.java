package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.LoginRequest;
import com.infosys.water_management.dto.Response.LoginResponse;
import com.infosys.water_management.dto.Request.RegisterRequest;
import com.infosys.water_management.dto.Response.UserResponse;
import com.infosys.water_management.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(
            @RequestBody RegisterRequest request) {

        UserResponse response = authService.createUser(
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(
                request
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/invitation/create")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<com.infosys.water_management.dto.Response.ResidentInvitationResponse> createInvitation(
            @RequestBody com.infosys.water_management.dto.Request.ResidentInvitationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createResidentInvitation(request));
    }

    @GetMapping("/invitation/validate")
    public ResponseEntity<com.infosys.water_management.dto.Response.ResidentInvitationResponse> validateInvitation(
            @RequestParam String token) {
        return ResponseEntity.ok(authService.validateInvitation(token));
    }

    @PostMapping("/register/resident")
    public ResponseEntity<UserResponse> completeResidentRegistration(
            @RequestBody com.infosys.water_management.dto.Request.ResidentRegistrationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.completeResidentRegistration(request));
    }

    @GetMapping("/pending-community-admins")
    public ResponseEntity<List<UserResponse>> getPendingCommunityAdmins() {

        return ResponseEntity.ok(
                authService.getPendingCommunityAdmins()
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

    @GetMapping("/profile")
    public ResponseEntity<com.infosys.water_management.dto.Response.UserProfileResponse> getProfile(
            org.springframework.security.core.Authentication authentication) {
        String email = "admin@water.com";
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof com.infosys.water_management.model.User u) {
                email = u.getEmail();
            } else if (principal instanceof String str) {
                email = str;
            } else {
                email = authentication.getName();
            }
        }
        return ResponseEntity.ok(authService.getUserProfile(email));
    }

    @PutMapping("/profile")
    public ResponseEntity<com.infosys.water_management.dto.Response.UserProfileResponse> updateProfile(
            @RequestBody com.infosys.water_management.dto.Response.UserProfileResponse request,
            org.springframework.security.core.Authentication authentication) {
        String email = "admin@water.com";
        if (authentication != null) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof com.infosys.water_management.model.User u) {
                email = u.getEmail();
            } else if (principal instanceof String str) {
                email = str;
            } else {
                email = authentication.getName();
            }
        }
        return ResponseEntity.ok(authService.updateUserProfile(email, request));
    }
}