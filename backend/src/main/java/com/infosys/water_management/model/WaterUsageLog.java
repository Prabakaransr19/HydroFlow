package com.infosys.water_management.model;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "water_usage_logs",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"household_id", "billing_month", "billing_year"}
                )
        }
)
public class WaterUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "billing_month", nullable = false)
    private Integer billingMonth;

    @Column(name = "billing_year", nullable = false)
    private Integer billingYear;

    @Column(name = "reading_date")
    private LocalDate readingDate;

    @Column
    private Double meterReading;

    @Column
    private Double previousReading;

    @Column(name = "water_consumed", nullable = false)
    private Double waterConsumed;

    private String remarks;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @ManyToOne
    @JoinColumn(name = "entered_by")
    private User enteredBy;

    public WaterUsageLog() {}

    public WaterUsageLog(Long id, Integer billingMonth, Integer billingYear, LocalDate readingDate, Double meterReading, Double previousReading, Double waterConsumed, String remarks, LocalDateTime createdAt, Household household, User enteredBy) {
        this.id = id;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.readingDate = readingDate;
        this.meterReading = meterReading;
        this.previousReading = previousReading;
        this.waterConsumed = waterConsumed;
        this.remarks = remarks;
        this.createdAt = createdAt;
        this.household = household;
        this.enteredBy = enteredBy;
    }

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (readingDate == null) {
            readingDate = LocalDate.now();
        }
        if (waterConsumed == null) {
            waterConsumed = meterReading != null ? meterReading : 0.0;
        }
        if (meterReading == null) {
            meterReading = waterConsumed != null ? waterConsumed : 0.0;
        }
        if (previousReading == null) {
            previousReading = 0.0;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getBillingMonth() { return billingMonth; }
    public void setBillingMonth(Integer billingMonth) { this.billingMonth = billingMonth; }

    public Integer getBillingYear() { return billingYear; }
    public void setBillingYear(Integer billingYear) { this.billingYear = billingYear; }

    public LocalDate getReadingDate() { return readingDate; }
    public void setReadingDate(LocalDate readingDate) { this.readingDate = readingDate; }

    public Double getMeterReading() { return meterReading; }
    public void setMeterReading(Double meterReading) { this.meterReading = meterReading; }

    public Double getCurrentReading() { return meterReading != null ? meterReading : waterConsumed; }
    public void setCurrentReading(Double reading) { this.meterReading = reading; }

    public Double getPreviousReading() { return previousReading; }
    public void setPreviousReading(Double previousReading) { this.previousReading = previousReading; }

    public Double getWaterConsumed() { return waterConsumed; }
    public void setWaterConsumed(Double waterConsumed) { this.waterConsumed = waterConsumed; }

    public Double getConsumption() { return waterConsumed; }
    public void setConsumption(Double consumption) { this.waterConsumed = consumption; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }

    public User getEnteredBy() { return enteredBy; }
    public void setEnteredBy(User enteredBy) { this.enteredBy = enteredBy; }

    public static WaterUsageLogBuilder builder() { return new WaterUsageLogBuilder(); }

    public static class WaterUsageLogBuilder {
        private Long id;
        private Integer billingMonth;
        private Integer billingYear;
        private LocalDate readingDate;
        private Double meterReading;
        private Double previousReading;
        private Double waterConsumed;
        private String remarks;
        private LocalDateTime createdAt;
        private Household household;
        private User enteredBy;

        public WaterUsageLogBuilder id(Long id) { this.id = id; return this; }
        public WaterUsageLogBuilder billingMonth(Integer billingMonth) { this.billingMonth = billingMonth; return this; }
        public WaterUsageLogBuilder billingYear(Integer billingYear) { this.billingYear = billingYear; return this; }
        public WaterUsageLogBuilder readingDate(LocalDate readingDate) { this.readingDate = readingDate; return this; }
        public WaterUsageLogBuilder meterReading(Double meterReading) { this.meterReading = meterReading; return this; }
        public WaterUsageLogBuilder previousReading(Double previousReading) { this.previousReading = previousReading; return this; }
        public WaterUsageLogBuilder waterConsumed(Double waterConsumed) { this.waterConsumed = waterConsumed; return this; }
        public WaterUsageLogBuilder remarks(String remarks) { this.remarks = remarks; return this; }
        public WaterUsageLogBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public WaterUsageLogBuilder household(Household household) { this.household = household; return this; }
        public WaterUsageLogBuilder enteredBy(User enteredBy) { this.enteredBy = enteredBy; return this; }

        public WaterUsageLog build() {
            return new WaterUsageLog(id, billingMonth, billingYear, readingDate, meterReading, previousReading, waterConsumed, remarks, createdAt, household, enteredBy);
        }
    }
}