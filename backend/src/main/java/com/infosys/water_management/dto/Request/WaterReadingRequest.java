package com.infosys.water_management.dto.Request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class WaterReadingRequest {

    @NotNull(message = "Household ID is required")
    private Long householdId;

    @NotNull(message = "Billing month is required")
    @Min(value = 1, message = "Month must be between 1 and 12")
    @Max(value = 12, message = "Month must be between 1 and 12")
    private Integer billingMonth;

    @NotNull(message = "Billing year is required")
    @Min(value = 2000, message = "Year must be valid")
    private Integer billingYear;

    private LocalDate readingDate;

    @NotNull(message = "Water consumption is required")
    @Min(value = 0, message = "Water consumption cannot be negative")
    private Double meterReading;

    private Double consumption;

    private String remarks;

    public WaterReadingRequest() {}

    public WaterReadingRequest(Long householdId, Integer billingMonth, Integer billingYear, LocalDate readingDate, Double meterReading, Double consumption, String remarks) {
        this.householdId = householdId;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.readingDate = readingDate;
        this.meterReading = meterReading;
        this.consumption = consumption != null ? consumption : meterReading;
        this.remarks = remarks;
    }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public Integer getBillingMonth() { return billingMonth; }
    public void setBillingMonth(Integer billingMonth) { this.billingMonth = billingMonth; }

    public Integer getBillingYear() { return billingYear; }
    public void setBillingYear(Integer billingYear) { this.billingYear = billingYear; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }

    public Double getMeterReading() { return meterReading != null ? meterReading : consumption; }
    public void setMeterReading(Double meterReading) { this.meterReading = meterReading; }

    public Double getConsumption() { return consumption != null ? consumption : meterReading; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static WaterReadingRequestBuilder builder() { return new WaterReadingRequestBuilder(); }

    public static class WaterReadingRequestBuilder {
        private Long householdId;
        private Integer billingMonth;
        private Integer billingYear;
        private LocalDate readingDate;
        private Double meterReading;
        private Double consumption;
        private String remarks;

        public WaterReadingRequestBuilder householdId(Long householdId) { this.householdId = householdId; return this; }
        public WaterReadingRequestBuilder billingMonth(Integer billingMonth) { this.billingMonth = billingMonth; return this; }
        public WaterReadingRequestBuilder billingYear(Integer billingYear) { this.billingYear = billingYear; return this; }
        public WaterReadingRequestBuilder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
        public WaterReadingRequestBuilder meterReading(Double meterReading) { this.meterReading = meterReading; return this; }
        public WaterReadingRequestBuilder consumption(Double consumption) { this.consumption = consumption; return this; }
        public WaterReadingRequestBuilder remarks(String remarks) { this.remarks = remarks; return this; }

        public WaterReadingRequest build() {
            return new WaterReadingRequest(householdId, billingMonth, billingYear, readingDate, meterReading, consumption, remarks);
        }
    }
}
