package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.AdminNoteRequest;
import com.infosys.water_management.dto.Request.ComplaintRequest;
import com.infosys.water_management.dto.Response.ComplaintResponse;
import com.infosys.water_management.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ComplaintResponse> raiseComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(complaintService.raiseComplaint(request, authentication));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        return ResponseEntity.ok(complaintService.getMyComplaints(authentication));
    }

    @GetMapping("/apartment/{apartmentId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getApartmentComplaints(
            @PathVariable Long apartmentId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(complaintService.getApartmentComplaints(apartmentId, status));
    }

    @PutMapping("/{id}/acknowledge")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ComplaintResponse> acknowledgeComplaint(
            @PathVariable Long id,
            @RequestBody(required = false) AdminNoteRequest request,
            Authentication authentication) {
        String adminNote = request != null ? request.getAdminNote() : null;
        return ResponseEntity.ok(complaintService.acknowledgeComplaint(id, adminNote, authentication));
    }

    @PutMapping("/{id}/resolve")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ComplaintResponse> resolveComplaint(
            @PathVariable Long id,
            @RequestBody(required = false) AdminNoteRequest request,
            Authentication authentication) {
        String adminNote = request != null ? request.getAdminNote() : null;
        return ResponseEntity.ok(complaintService.resolveComplaint(id, adminNote, authentication));
    }
}
