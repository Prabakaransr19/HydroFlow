package com.infosys.water_management.dto.Response;

import java.time.LocalDate;

public class WaterReadingResponse {

    private Long id;
    private Long householdId;
    private String flatNumber;
    private Integer billingMonth;
    private Integer billingYear;
    private LocalDate readingDate;
    private Double previousReading;
    private Double currentReading;
    private Double waterConsumed;
    private Double consumption;
    private String remarks;

    public WaterReadingResponse() {}

    public WaterReadingResponse(Long id, Long householdId, String flatNumber, Integer billingMonth, Integer billingYear, LocalDate readingDate, Double previousReading, Double currentReading, Double waterConsumed, Double consumption, String remarks) {
        this.id = id;
        this.householdId = householdId;
        this.flatNumber = flatNumber;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.readingDate = readingDate;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.waterConsumed = waterConsumed;
        this.consumption = consumption != null ? consumption : waterConsumed;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getHouseholdId() { return householdId; }
    public void setHouseholdId(Long householdId) { this.householdId = householdId; }

    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }

    public Integer getBillingMonth() { return billingMonth; }
    public void setBillingMonth(Integer billingMonth) { this.billingMonth = billingMonth; }

    public Integer getBillingYear() { return billingYear; }
    public void setBillingYear(Integer billingYear) { this.billingYear = billingYear; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }

    public Double getPreviousReading() { return previousReading; }
    public void setPreviousReading(Double previousReading) { this.previousReading = previousReading; }

    public Double getCurrentReading() { return currentReading; }
    public void setCurrentReading(Double currentReading) { this.currentReading = currentReading; }

    public Double getWaterConsumed() { return waterConsumed; }
    public void setWaterConsumed(Double waterConsumed) { this.waterConsumed = waterConsumed; }

    public Double getConsumption() { return consumption != null ? consumption : waterConsumed; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public static WaterReadingResponseBuilder builder() { return new WaterReadingResponseBuilder(); }

    public static class WaterReadingResponseBuilder {
        private Long id;
        private Long householdId;
        private String flatNumber;
        private Integer billingMonth;
        private Integer billingYear;
        private LocalDate readingDate;
        private Double previousReading;
        private Double currentReading;
        private Double waterConsumed;
        private Double consumption;
        private String remarks;

        public WaterReadingResponseBuilder id(Long id) { this.id = id; return this; }
        public WaterReadingResponseBuilder householdId(Long householdId) { this.householdId = householdId; return this; }
        public WaterReadingResponseBuilder flatNumber(String flatNumber) { this.flatNumber = flatNumber; return this; }
        public WaterReadingResponseBuilder billingMonth(Integer billingMonth) { this.billingMonth = billingMonth; return this; }
        public WaterReadingResponseBuilder billingYear(Integer billingYear) { this.billingYear = billingYear; return this; }
        public WaterReadingResponseBuilder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
        public WaterReadingResponseBuilder previousReading(Double previousReading) { this.previousReading = previousReading; return this; }
        public WaterReadingResponseBuilder currentReading(Double currentReading) { this.currentReading = currentReading; return this; }
        public WaterReadingResponseBuilder waterConsumed(Double waterConsumed) { this.waterConsumed = waterConsumed; return this; }
        public WaterReadingResponseBuilder consumption(Double consumption) { this.consumption = consumption; return this; }
        public WaterReadingResponseBuilder remarks(String remarks) { this.remarks = remarks; return this; }

        public WaterReadingResponse build() {
            return new WaterReadingResponse(id, householdId, flatNumber, billingMonth, billingYear, readingDate, previousReading, currentReading, waterConsumed, consumption, remarks);
        }
    }
}
