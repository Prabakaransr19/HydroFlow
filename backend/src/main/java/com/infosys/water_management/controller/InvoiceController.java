package com.infosys.water_management.controller;

import com.infosys.water_management.dto.Response.InvoiceResponse;
import com.infosys.water_management.service.InvoiceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.infosys.water_management.dto.Request.RazorpayVerificationRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @PostMapping("/generate/{billingCycleId}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN')")
    public ResponseEntity<InvoiceResponse> generateInvoice(@PathVariable Long billingCycleId) {
        InvoiceResponse response = invoiceService.generateInvoice(billingCycleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/razorpay/order")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<java.util.Map<String, Object>> createRazorpayOrder(@PathVariable Long id, org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(invoiceService.createRazorpayOrder(id, authentication));
    }

    @PostMapping("/{id}/razorpay/verify")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<InvoiceResponse> verifyRazorpayPayment(@PathVariable Long id, @RequestBody RazorpayVerificationRequest request, org.springframework.security.core.Authentication authentication) {
        return ResponseEntity.ok(invoiceService.verifyRazorpayPayment(id, request, authentication));
    }

    @GetMapping
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<java.util.List<InvoiceResponse>> getInvoices(
            @RequestParam(required = false) Long householdId) {
        return ResponseEntity.ok(invoiceService.getInvoices(householdId, org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMMUNITY_ADMIN') or hasRole('RESIDENT')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id, org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication()));
    }
}