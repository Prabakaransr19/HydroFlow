package com.infosys.water_management.dto.Response;

import lombok.Builder;

@Builder
public class BillingCalculationResponse {

    private Long householdId;
    private Long billingCycleId;

    private Integer billingMonth;
    private Integer billingYear;

    private Double consumption;
    private Double waterCharge;
    private Double sharedCharge;
    private Double totalBill;

    public BillingCalculationResponse() {
    }

    public BillingCalculationResponse(
            Long householdId,
            Long billingCycleId,
            Integer billingMonth,
            Integer billingYear,
            Double consumption,
            Double waterCharge,
            Double sharedCharge,
            Double totalBill) {

        this.householdId = householdId;
        this.billingCycleId = billingCycleId;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.consumption = consumption;
        this.waterCharge = waterCharge;
        this.sharedCharge = sharedCharge;
        this.totalBill = totalBill;
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

    public Integer getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(Integer billingMonth) {
        this.billingMonth = billingMonth;
    }

    public Integer getBillingYear() {
        return billingYear;
    }

    public void setBillingYear(Integer billingYear) {
        this.billingYear = billingYear;
    }

    public Double getConsumption() {
        return consumption;
    }

    public void setConsumption(Double consumption) {
        this.consumption = consumption;
    }

    public Double getWaterCharge() {
        return waterCharge;
    }

    public void setWaterCharge(Double waterCharge) {
        this.waterCharge = waterCharge;
    }

    public Double getSharedCharge() {
        return sharedCharge;
    }

    public void setSharedCharge(Double sharedCharge) {
        this.sharedCharge = sharedCharge;
    }

    public Double getTotalBill() {
        return totalBill;
    }

    public void setTotalBill(Double totalBill) {
        this.totalBill = totalBill;
    }
}