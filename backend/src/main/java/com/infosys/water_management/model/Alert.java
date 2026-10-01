package com.infosys.water_management.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "current_usage")
    private Double currentUsage;

    @Column(name = "threshold_value")
    private Double thresholdValue;

    @Column(nullable = false)
    private boolean acknowledged;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Alert() {
    }

    public Alert(
            Household household,
            String type,
            String message,
            Double currentUsage,
            Double thresholdValue) {

        this.household = household;
        this.type = type;
        this.message = message;
        this.currentUsage = currentUsage;
        this.thresholdValue = thresholdValue;
        this.acknowledged = false;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Household getHousehold() {
        return household;
    }

    public void setHousehold(Household household) {
        this.household = household;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Double getCurrentUsage() {
        return currentUsage;
    }

    public void setCurrentUsage(Double currentUsage) {
        this.currentUsage = currentUsage;
    }

    public Double getThresholdValue() {
        return thresholdValue;
    }

    public void setThresholdValue(Double thresholdValue) {
        this.thresholdValue = thresholdValue;
    }

    public boolean isAcknowledged() {
        return acknowledged;
    }

    public void setAcknowledged(boolean acknowledged) {
        this.acknowledged = acknowledged;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}