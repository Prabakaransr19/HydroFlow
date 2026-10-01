package com.infosys.water_management.dto.Response;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public class AlertResponse {

    private Long id;
    private Long householdId;
    private String flatNumber;

    private String type;
    private String message;

    private Double currentUsage;
    private Double thresholdValue;

    private boolean acknowledged;
    private LocalDateTime createdAt;

    public AlertResponse() {
    }

    public AlertResponse(
            Long id,
            Long householdId,
            String flatNumber,
            String type,
            String message,
            Double currentUsage,
            Double thresholdValue,
            boolean acknowledged,
            LocalDateTime createdAt) {

        this.id = id;
        this.householdId = householdId;
        this.flatNumber = flatNumber;
        this.type = type;
        this.message = message;
        this.currentUsage = currentUsage;
        this.thresholdValue = thresholdValue;
        this.acknowledged = acknowledged;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getHouseholdId() {
        return householdId;
    }

    public void setHouseholdId(Long householdId) {
        this.householdId = householdId;
    }

    public String getFlatNumber() {
        return flatNumber;
    }

    public void setFlatNumber(String flatNumber) {
        this.flatNumber = flatNumber;
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