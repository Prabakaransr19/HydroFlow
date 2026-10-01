package com.infosys.water_management.service;

import com.infosys.water_management.dto.Response.InvoiceResponse;
import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.Invoice;
import com.infosys.water_management.model.User;
import com.infosys.water_management.model.Role;
import com.infosys.water_management.repository.UserRepository;
import com.infosys.water_management.repository.BillingCycleRepository;
import com.infosys.water_management.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import org.json.JSONObject;

import java.time.LocalDateTime;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final String razorpayKeyId;
    private final String razorpayKeySecret;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            BillingCycleRepository billingCycleRepository,
            UserRepository userRepository,
            EmailService emailService,
            @Value("${razorpay.key-id}") String razorpayKeyId,
            @Value("${razorpay.key-secret}") String razorpayKeySecret) {
        this.invoiceRepository = invoiceRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.razorpayKeyId = razorpayKeyId;
        this.razorpayKeySecret = razorpayKeySecret;
    }

    @Transactional
    public InvoiceResponse generateInvoice(Long billingCycleId) {
        BillingCycle billingCycle = billingCycleRepository
                .findById(billingCycleId)
                .orElseThrow(() -> new RuntimeException("Billing cycle not found with id: " + billingCycleId));

        Household household = billingCycle.getHousehold();
        if (household == null) {
            throw new RuntimeException("Billing cycle is not associated with a household");
        }

        java.util.Optional<Invoice> existingOpt = invoiceRepository.findByHouseholdIdAndBillingCycleId(household.getId(), billingCycleId);
        if (existingOpt.isPresent()) {
            return mapToResponse(existingOpt.get());
        }

        if (billingCycle.getTotalConsumption() == null
                || billingCycle.getWaterCharge() == null
                || billingCycle.getTotalBill() == null) {
            throw new IllegalArgumentException("Billing must be calculated before generating invoice");
        }

        double sharedCharge = billingCycle.getSharedCharge() != null ? billingCycle.getSharedCharge() : 0.0;
        double adjustments = 0.0;
        double totalAmount = billingCycle.getWaterCharge() + sharedCharge + adjustments;

        Invoice invoice = Invoice.builder()
                .household(household)
                .billingCycle(billingCycle)
                .consumption(billingCycle.getTotalConsumption())
                .baseWaterCharge(billingCycle.getWaterCharge())
                .sharedAreaCharge(sharedCharge)
                .adjustments(adjustments)
                .totalAmount(totalAmount)
                .status("UNPAID")
                .build();

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    public java.util.Map<String, Object> createRazorpayOrder(Long invoiceId, org.springframework.security.core.Authentication authentication) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        ensureResidentOwnsInvoice(invoice, authentication);
        if ("PAID".equalsIgnoreCase(invoice.getStatus())) throw new IllegalArgumentException("Invoice is already paid.");
        if (razorpayKeyId.isBlank() || razorpayKeySecret.isBlank()) throw new IllegalStateException("Razorpay credentials are not configured.");
        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject options = new JSONObject();
            options.put("amount", Math.round(invoice.getTotalAmount() * 100));
            options.put("currency", "INR");
            options.put("receipt", "invoice_" + invoiceId);
            Order order = client.orders.create(options);
            return java.util.Map.of("keyId", razorpayKeyId, "orderId", order.get("id"), "amount", options.getLong("amount"), "currency", "INR", "invoiceId", invoiceId);
        } catch (Exception exception) {
            throw new RuntimeException("Unable to create Razorpay order.", exception);
        }
    }

    @Transactional
    public InvoiceResponse verifyRazorpayPayment(Long invoiceId, com.infosys.water_management.dto.Request.RazorpayVerificationRequest request, org.springframework.security.core.Authentication authentication) {
        Invoice invoice = invoiceRepository.findById(invoiceId).orElseThrow(() -> new RuntimeException("Invoice not found with ID: " + invoiceId));
        ensureResidentOwnsInvoice(invoice, authentication);
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", request.getRazorpayOrderId());
            attributes.put("razorpay_payment_id", request.getRazorpayPaymentId());
            attributes.put("razorpay_signature", request.getRazorpaySignature());
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            Order order = client.orders.fetch(request.getRazorpayOrderId());
            if (!("invoice_" + invoiceId).equals(order.get("receipt"))
                    || getOrderAmountInPaise(order) != Math.round(invoice.getTotalAmount() * 100)) {
                throw new org.springframework.security.access.AccessDeniedException("Razorpay order does not match this invoice.");
            }
            if (!Utils.verifyPaymentSignature(attributes, razorpayKeySecret)) throw new org.springframework.security.access.AccessDeniedException("Invalid Razorpay payment signature.");
        } catch (Exception exception) {
            throw new org.springframework.security.access.AccessDeniedException("Razorpay payment verification failed.", exception);
        }
        invoice.setStatus("PAID");
        invoice.setPaidAt(LocalDateTime.now());
        invoice.setPaymentMethod("RAZORPAY");
        invoice.setPaymentReference(request.getRazorpayPaymentId());
        Invoice saved = invoiceRepository.save(invoice);

        try {
            String recipientEmail = (invoice.getHousehold() != null && invoice.getHousehold().getUsers() != null && !invoice.getHousehold().getUsers().isEmpty())
                    ? invoice.getHousehold().getUsers().get(0).getEmail()
                    : (authentication != null ? authentication.getName() : null);
            if (recipientEmail != null && !recipientEmail.isBlank()) {
                String subject = "Payment Receipt - Invoice #" + saved.getId();
                String body = String.format(
                        "Dear Resident,\n\nYour payment for Invoice #%d has been successfully processed.\n\n" +
                        "Payment Details:\n" +
                        "- Invoice ID: %d\n" +
                        "- Water Consumption: %.2f kL\n" +
                        "- Amount Paid: ₹%.2f\n" +
                        "- Payment Reference: %s\n" +
                        "- Date Paid: %s\n\n" +
                        "Thank you,\nHydroFlow Management Team",
                        saved.getId(), saved.getId(), saved.getConsumption(), saved.getTotalAmount(),
                        saved.getPaymentReference(), saved.getPaidAt()
                );
                emailService.sendSimpleEmail(recipientEmail, subject, body);
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(InvoiceService.class).error("Error sending payment confirmation email for invoice {}", saved.getId(), e);
        }

        return mapToResponse(saved);
    }

    public java.util.List<InvoiceResponse> getInvoices(Long householdId, org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            User resident = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("Resident not found"));
            householdId = resident.getHousehold() != null ? resident.getHousehold().getId() : -1L;
        }
        java.util.List<Invoice> invoices = (householdId != null)
                ? invoiceRepository.findByHouseholdId(householdId)
                : invoiceRepository.findAll();

        return invoices.stream().map(this::mapToResponse).toList();
    }

    private void ensureResidentOwnsInvoice(Invoice invoice, org.springframework.security.core.Authentication authentication) {
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_RESIDENT"))) {
            User resident = userRepository.findByEmail(authentication.getName()).orElseThrow(() -> new RuntimeException("Resident not found"));
            if (resident.getHousehold() == null || invoice.getHousehold() == null || !resident.getHousehold().getId().equals(invoice.getHousehold().getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Residents can access only their own invoices.");
            }
        }
    }

    private long getOrderAmountInPaise(Order order) {
        Object amount = order.get("amount");
        if (amount instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(amount));
    }

    public InvoiceResponse getInvoiceById(Long id, org.springframework.security.core.Authentication authentication) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        ensureResidentOwnsInvoice(inv, authentication);

        return mapToResponse(inv);
    }

    private InvoiceResponse mapToResponse(Invoice inv) {
        Household hh = inv.getHousehold();
        String flatNumber = hh != null ? hh.getFlatNumber() : "A101";
        String companyName = (hh != null && hh.getApartment() != null) ? hh.getApartment().getName() : "Green Valley Residency";

        String residentName = "Amit Patel (Flat " + flatNumber + ")";
        String residentEmail = "resident" + flatNumber.toLowerCase().replaceAll("[^a-z0-9]", "") + "@water.com";

        String billingMonth = "August 2026";
        if (inv.getBillingCycle() != null) {
            billingMonth = "Month " + inv.getBillingCycle().getBillingMonth() + " " + inv.getBillingCycle().getBillingYear();
        }

        double consumption = inv.getConsumption() != null ? inv.getConsumption() : 18.5;
        double previousReading = 120.0;
        double currentReading = previousReading + consumption;

        // Progressive 3-Tier Tariff Calculation Splitup
        double tier1Usage = Math.min(consumption, 10.0);
        double tier1Rate = 10.0;
        double tier1Charge = tier1Usage * tier1Rate;

        double tier2Usage = Math.max(0.0, Math.min(consumption - 10.0, 15.0));
        double tier2Rate = 15.0;
        double tier2Charge = tier2Usage * tier2Rate;

        double tier3Usage = Math.max(0.0, consumption - 25.0);
        double tier3Rate = 25.0;
        double tier3Charge = tier3Usage * tier3Rate;

        double baseWaterCharge = inv.getBaseWaterCharge() != null ? inv.getBaseWaterCharge() : (tier1Charge + tier2Charge + tier3Charge);
        double sharedAreaCharge = inv.getSharedAreaCharge() != null ? inv.getSharedAreaCharge() : 60.0;
        double adjustments = inv.getAdjustments() != null ? inv.getAdjustments() : 0.0;
        double totalAmount = inv.getTotalAmount() != null ? inv.getTotalAmount() : (baseWaterCharge + sharedAreaCharge + adjustments);

        return new InvoiceResponse(
                inv.getId(),
                hh != null ? hh.getId() : null,
                inv.getBillingCycle() != null ? inv.getBillingCycle().getId() : null,
                flatNumber,
                residentName,
                residentEmail,
                companyName,
                billingMonth,
                previousReading,
                currentReading,
                consumption,
                tier1Usage,
                tier1Rate,
                tier1Charge,
                tier2Usage,
                tier2Rate,
                tier2Charge,
                tier3Usage,
                tier3Rate,
                tier3Charge,
                baseWaterCharge,
                sharedAreaCharge,
                adjustments,
                totalAmount,
                inv.getStatus(),
                inv.getPaidAt(),
                inv.getPaymentReference(),
                inv.getPaymentMethod()
        );
    }
}