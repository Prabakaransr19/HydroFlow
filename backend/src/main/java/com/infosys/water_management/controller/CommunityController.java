package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.ResidentInvitationRequest;
import com.infosys.water_management.dto.Response.ResidentInvitationResponse;
import com.infosys.water_management.service.AuthService;
import com.infosys.water_management.dto.Request.CommunityAdminSetupRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final AuthService authService;

    public CommunityController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/setup")
    public ResponseEntity<com.infosys.water_management.dto.Response.UserResponse> setup(
            @RequestBody CommunityAdminSetupRequest request,
            org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(authService.completeCommunityAdminSetup(authentication.getName(), request));
    }

    @PostMapping("/invite-resident")
    public ResponseEntity<ResidentInvitationResponse> inviteResident(
            @RequestBody ResidentInvitationRequest request) {

        ResidentInvitationResponse response =
                authService.inviteResident(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

}