package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Request.ApartmentRequest;
import com.infosys.water_management.dto.Response.ApartmentResponse;
import com.infosys.water_management.service.ApartmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/apartments")
public class ApartmentController {

    private final ApartmentService apartmentService;

    public ApartmentController(ApartmentService apartmentService) {
        this.apartmentService = apartmentService;
    }

    @PostMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApartmentResponse> createApartment(@Valid @RequestBody ApartmentRequest request) {
        ApartmentResponse response = apartmentService.createApartment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<java.util.List<ApartmentResponse>> getApartments() {
        return ResponseEntity.ok(apartmentService.getApartments());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('SUPER_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<ApartmentResponse> getApartmentById(@PathVariable Long id) {
        return ResponseEntity.ok(apartmentService.getApartmentById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<ApartmentResponse> updateApartment(@PathVariable Long id, @Valid @RequestBody ApartmentRequest request) {
        return ResponseEntity.ok(apartmentService.updateApartment(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN') or hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<Void> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.noContent().build();
    }
}