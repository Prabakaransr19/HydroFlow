package com.infosys.water_management.dto.Request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public class BillingCalculationRequest {

    @NotNull(message = "Household ID is required")
    @Positive(message = "Household ID must be positive")
    private Long householdId;

    @Positive(message = "Billing cycle ID must be positive")
    private Long billingCycleId;

    @Positive(message = "Billing month must be positive")
    private Integer billingMonth;

    @Positive(message = "Billing year must be positive")
    private Integer billingYear;

    @NotNull(message = "Current meter reading is required")
    @PositiveOrZero(message = "Current meter reading cannot be negative")
    private Double currentReading;

    public BillingCalculationRequest() {
    }

    public BillingCalculationRequest(
            Long householdId,
            Long billingCycleId) {

        this.householdId = householdId;
        this.billingCycleId = billingCycleId;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public Long getBillingCycleId() {
        return billingCycleId;
    }

    public void setBillingCycleId(Long billingCycleId) {
        this.billingCycleId = billingCycleId;
    }

    public Integer getBillingMonth() { return billingMonth; }
    public void setBillingMonth(Integer billingMonth) { this.billingMonth = billingMonth; }
    public Integer getBillingYear() { return billingYear; }
    public void setBillingYear(Integer billingYear) { this.billingYear = billingYear; }
    public Double getCurrentReading() { return currentReading; }
    public void setCurrentReading(Double currentReading) { this.currentReading = currentReading; }
}