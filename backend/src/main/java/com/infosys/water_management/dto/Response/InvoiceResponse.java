package com.infosys.water_management.dto.Response;

import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long invoiceId;
    private Long householdId;
    private Long billingCycleId;

    // Entity & User Metadata
    private String flatNumber;
    private String residentName;
    private String residentEmail;
    private String companyName;
    private String billingMonth;

    // Meter Telemetry
    private Double previousReading;
    private Double currentReading;
    private Double consumption;

    // Tariff Tier Splitup Breakdown
    private Double tier1Usage;
    private Double tier1Rate;
    private Double tier1Charge;

    private Double tier2Usage;
    private Double tier2Rate;
    private Double tier2Charge;

    private Double tier3Usage;
    private Double tier3Rate;
    private Double tier3Charge;

    // Summary Charges
    private Double baseWaterCharge;
    private Double sharedAreaCharge;
    private Double adjustments;
    private Double totalAmount;

    // Payment Info
    private String status;
    private LocalDateTime paidAt;
    private String paymentReference;
    private String paymentMethod;

    public InvoiceResponse() {}

    public InvoiceResponse(Long invoiceId, Long householdId, Long billingCycleId, String flatNumber, String residentName, String residentEmail, String companyName, String billingMonth, Double previousReading, Double currentReading, Double consumption, Double tier1Usage, Double tier1Rate, Double tier1Charge, Double tier2Usage, Double tier2Rate, Double tier2Charge, Double tier3Usage, Double tier3Rate, Double tier3Charge, Double baseWaterCharge, Double sharedAreaCharge, Double adjustments, Double totalAmount, String status, LocalDateTime paidAt, String paymentReference, String paymentMethod) {
        this.invoiceId = invoiceId;
        this.householdId = householdId;
        this.billingCycleId = billingCycleId;
        this.flatNumber = flatNumber;
        this.residentName = residentName;
        this.residentEmail = residentEmail;
        this.companyName = companyName;
        this.billingMonth = billingMonth;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.consumption = consumption;
        this.tier1Usage = tier1Usage;
        this.tier1Rate = tier1Rate;
        this.tier1Charge = tier1Charge;
        this.tier2Usage = tier2Usage;
        this.tier2Rate = tier2Rate;
        this.tier2Charge = tier2Charge;
        this.tier3Usage = tier3Usage;
        this.tier3Rate = tier3Rate;
        this.tier3Charge = tier3Charge;
        this.baseWaterCharge = baseWaterCharge;
        this.sharedAreaCharge = sharedAreaCharge;
        this.adjustments = adjustments;
        this.totalAmount = totalAmount;
        this.status = status != null ? status : "UNPAID";
        this.paidAt = paidAt;
        this.paymentReference = paymentReference;
        this.paymentMethod = paymentMethod;
    }

    public Long getId() { return invoiceId; }
    public Long getInvoiceId() { return invoiceId; }
    public void setInvoiceId(Long invoiceId) { this.invoiceId = invoiceId; }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public Long getBillingCycleId() { return billingCycleId; }
    public void setBillingCycleId(Long billingCycleId) { this.billingCycleId = billingCycleId; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getResidentEmail() { return residentEmail; }
    public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public Double getPreviousReading() { return previousReading; }
    public void setPreviousReading(Double previousReading) { this.previousReading = previousReading; }

    public Double getCurrentReading() { return currentReading; }
    public void setCurrentReading(Double currentReading) { this.currentReading = currentReading; }

    public Double getConsumption() { return consumption; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }

    public Double getTier1Usage() { return tier1Usage; }
    public void setTier1Usage(Double tier1Usage) { this.tier1Usage = tier1Usage; }

    public Double getTier1Rate() { return tier1Rate; }
    public void setTier1Rate(Double tier1Rate) { this.tier1Rate = tier1Rate; }

    public Double getTier1Charge() { return tier1Charge; }
    public void setTier1Charge(Double tier1Charge) { this.tier1Charge = tier1Charge; }

    public Double getTier2Usage() { return tier2Usage; }
    public void setTier2Usage(Double tier2Usage) { this.tier2Usage = tier2Usage; }

    public Double getTier2Rate() { return tier2Rate; }
    public void setTier2Rate(Double tier2Rate) { this.tier2Rate = tier2Rate; }

    public Double getTier2Charge() { return tier2Charge; }
    public void setTier2Charge(Double tier2Charge) { this.tier2Charge = tier2Charge; }

    public Double getTier3Usage() { return tier3Usage; }
    public void setTier3Usage(Double tier3Usage) { this.tier3Usage = tier3Usage; }

    public Double getTier3Rate() { return tier3Rate; }
    public void setTier3Rate(Double tier3Rate) { this.tier3Rate = tier3Rate; }

    public Double getTier3Charge() { return tier3Charge; }
    public void setTier3Charge(Double tier3Charge) { this.tier3Charge = tier3Charge; }

    public Double getBaseWaterCharge() { return baseWaterCharge; }
    public void setBaseWaterCharge(Double baseWaterCharge) { this.baseWaterCharge = baseWaterCharge; }

    public Double getSharedAreaCharge() { return sharedAreaCharge; }
    public void setSharedAreaCharge(Double sharedAreaCharge) { this.sharedAreaCharge = sharedAreaCharge; }

    public Double getAdjustments() { return adjustments; }
    public void setAdjustments(Double adjustments) { this.adjustments = adjustments; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}