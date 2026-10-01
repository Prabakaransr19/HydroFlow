package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.ResidentRegistrationRequest;
import com.infosys.water_management.dto.Response.UserResponse;
import com.infosys.water_management.model.ResidentInvitation;
import com.infosys.water_management.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/resident")
public class ResidentController {

    private final AuthService authService;

    public ResidentController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerResident(
            @RequestBody ResidentRegistrationRequest request) {

        UserResponse response =
                authService.completeResidentRegistration(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @GetMapping("/validate")
    public ResponseEntity<com.infosys.water_management.dto.Response.ResidentInvitationResponse> validateInvitation(
            @RequestParam String token) {

        return ResponseEntity.ok(
                authService.validateInvitation(token)
        );
    }

}