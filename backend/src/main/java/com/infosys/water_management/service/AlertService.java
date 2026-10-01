package com.infosys.water_management.service;

import com.infosys.water_management.dto.Response.AlertResponse;
import com.infosys.water_management.model.Alert;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.AlertRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class AlertService {

    public static final double DEFAULT_USAGE_THRESHOLD = 20.0;

    private final AlertRepository alertRepository;
    private final HouseholdRepository householdRepository;
    private final WaterUsageRepository waterUsageRepository;

    public AlertService(
            AlertRepository alertRepository,
            HouseholdRepository householdRepository,
            WaterUsageRepository waterUsageRepository) {

        this.alertRepository = alertRepository;
        this.householdRepository = householdRepository;
        this.waterUsageRepository = waterUsageRepository;
    }

    /**
     * Get all unacknowledged alerts in the system.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getSystemAlerts() {

        return alertRepository
                .findByAcknowledgedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Checks whether current usage exceeds
     * the configured usage threshold.
     */
    @Transactional
    public AlertResponse checkUsageThreshold(
            Long householdId,
            Double currentUsage,
            Double threshold) {

        validateUsageValues(
                currentUsage,
                threshold
        );

        Household household =
                findHousehold(householdId);

        if (currentUsage <= threshold) {
            return null;
        }

        boolean existingAlert =
                alertRepository
                        .existsByHouseholdIdAndTypeAndAcknowledgedFalse(
                                householdId,
                                "OVERUSE"
                        );

        if (existingAlert) {
            return null;
        }

        Alert alert = new Alert(
                household,
                "OVERUSE",
                "Water usage has exceeded the configured threshold.",
                currentUsage,
                threshold
        );

        return toResponse(
                alertRepository.save(alert)
        );
    }

    /**
     * Checks whether current usage is anomalously high.
     *
     * Rule:
     *
     * current usage > average + 2 * standard deviation
     */
    @Transactional
    public AlertResponse checkAnomaly(
            Long householdId,
            Double currentUsage) {

        if (currentUsage == null || currentUsage < 0) {
            throw new IllegalArgumentException(
                    "Current usage must be zero or greater"
            );
        }

        Household household =
                findHousehold(householdId);

        List<WaterUsageLog> logs =
                waterUsageRepository
                        .findByHouseholdIdAndReadingDateBetween(
                                householdId,
                                LocalDate.of(2000, 1, 1),
                                LocalDate.now().minusDays(1)
                        );

        if (logs.size() < 2) {
            return null;
        }

        double[] usages = logs.stream()
                .map(WaterUsageLog::getWaterConsumed)
                .filter(value ->
                        value != null && value >= 0
                )
                .mapToDouble(Double::doubleValue)
                .toArray();

        if (usages.length < 2) {
            return null;
        }

        double average =
                calculateAverage(usages);

        double standardDeviation =
                calculateStandardDeviation(
                        usages,
                        average
                );

        double anomalyThreshold =
                average + (2 * standardDeviation);

        if (currentUsage <= anomalyThreshold) {
            return null;
        }

        boolean existingAlert =
                alertRepository
                        .existsByHouseholdIdAndTypeAndAcknowledgedFalse(
                                householdId,
                                "ANOMALY"
                        );

        if (existingAlert) {
            return null;
        }

        Alert alert = new Alert(
                household,
                "ANOMALY",
                "Unusually high water consumption detected.",
                currentUsage,
                anomalyThreshold
        );

        return toResponse(
                alertRepository.save(alert)
        );
    }

    /**
     * Returns all alerts for a household.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getHouseholdAlerts(
            Long householdId) {

        findHousehold(householdId);

        return alertRepository
                .findByHouseholdIdOrderByCreatedAtDesc(
                        householdId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns all unacknowledged alerts for a household.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getUnreadAlerts(
            Long householdId) {

        findHousehold(householdId);

        return alertRepository
                .findByHouseholdIdAndAcknowledgedFalseOrderByCreatedAtDesc(
                        householdId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns all unacknowledged alerts in the system.
     */
    @Transactional(readOnly = true)
    public List<AlertResponse> getUnreadSystemAlerts() {
        return alertRepository
                .findByAcknowledgedFalse()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Acknowledges an alert.
     */
    @Transactional
    public AlertResponse acknowledgeAlert(
            Long alertId) {

        Alert alert = alertRepository
                .findById(alertId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Alert not found with id: "
                                        + alertId
                        )
                );

        alert.setAcknowledged(true);

        return toResponse(
                alertRepository.save(alert)
        );
    }

    /**
     * Convert JPA Alert entity to DTO.
     *
     * IMPORTANT:
     * We intentionally do NOT return the Alert entity
     * directly because it contains a Household relationship.
     */
    private AlertResponse toResponse(Alert alert) {
        if (alert == null) {
            return null;
        }

        Household household =
                alert.getHousehold();

        return new AlertResponse(
                alert.getId(),

                household != null
                        ? household.getId()
                        : null,

                household != null
                        ? household.getFlatNumber()
                        : null,

                alert.getType(),
                alert.getMessage(),
                alert.getCurrentUsage(),
                alert.getThresholdValue(),
                alert.isAcknowledged(),
                alert.getCreatedAt()
        );
    }

    private Household findHousehold(
            Long householdId) {

        if (householdId == null || householdId <= 0) {
            throw new IllegalArgumentException(
                    "Household ID must be valid"
            );
        }

        return householdRepository
                .findById(householdId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Household not found with id: "
                                        + householdId
                        )
                );
    }

    private void validateUsageValues(
            Double currentUsage,
            Double threshold) {

        if (currentUsage == null || currentUsage < 0) {
            throw new IllegalArgumentException(
                    "Current usage must be zero or greater"
            );
        }

        if (threshold == null || threshold < 0) {
            throw new IllegalArgumentException(
                    "Threshold must be zero or greater"
            );
        }
    }

    private double calculateAverage(
            double[] values) {

        double sum = 0.0;

        for (double value : values) {
            sum += value;
        }

        return sum / values.length;
    }

    private double calculateStandardDeviation(
            double[] values,
            double average) {

        double sum = 0.0;

        for (double value : values) {

            double difference =
                    value - average;

            sum += difference * difference;
        }

        return Math.sqrt(
                sum / values.length
        );
    }
}