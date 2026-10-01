package com.infosys.water_management.service;

import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.WaterPurchase;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.BillingCycleRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.WaterPurchaseRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConsumptionDistributionService {

    private final HouseholdRepository householdRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;

    public ConsumptionDistributionService(
            HouseholdRepository householdRepository,
            WaterUsageRepository waterUsageRepository,
            BillingCycleRepository billingCycleRepository,
            WaterPurchaseRepository waterPurchaseRepository) {

        this.householdRepository = householdRepository;
        this.waterUsageRepository = waterUsageRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.waterPurchaseRepository = waterPurchaseRepository;
    }

    @Transactional
    public Map<Long, Double> distributeCost(
            Long apartmentId,
            Integer billingMonth,
            Integer billingYear) {

        validateBillingPeriod(
                apartmentId,
                billingMonth,
                billingYear
        );

        List<Household> households =
                householdRepository.findByApartmentId(apartmentId);

        if (households.isEmpty()) {
            throw new IllegalArgumentException(
                    "No households found for apartment: "
                            + apartmentId
            );
        }

        YearMonth billingPeriod =
                YearMonth.of(
                        billingYear,
                        billingMonth
                );

        LocalDate startDate =
                billingPeriod.atDay(1);

        LocalDate endDate =
                billingPeriod.atEndOfMonth();

        /*
         * Get all water purchases for this billing period.
         */
        List<WaterPurchase> purchases =
                waterPurchaseRepository
                        .findByApartmentIdAndPurchaseDateBetween(
                                apartmentId,
                                startDate,
                                endDate
                        );

        double totalApartmentCost = purchases.stream()
                .map(WaterPurchase::getTotalCost)
                .filter(cost -> cost != null && cost >= 0)
                .mapToDouble(Double::doubleValue)
                .sum();

        if (totalApartmentCost <= 0) {
            throw new IllegalArgumentException(
                    "No water purchase cost found for billing period"
            );
        }

        /*
         * Calculate household consumption.
         */
        Map<Long, Double> householdConsumption =
                new HashMap<>();

        double totalConsumption = 0.0;

        for (Household household : households) {

            List<WaterUsageLog> logs =
                    waterUsageRepository
                            .findByHouseholdIdAndReadingDateBetween(
                                    household.getId(),
                                    startDate,
                                    endDate
                            );

            double consumption = logs.stream()
                    .map(WaterUsageLog::getWaterConsumed)
                    .filter(value ->
                            value != null && value >= 0
                    )
                    .mapToDouble(Double::doubleValue)
                    .sum();

            householdConsumption.put(
                    household.getId(),
                    consumption
            );

            totalConsumption += consumption;
        }

        Map<Long, Double> allocations;

        /*
         * Consumption-based distribution.
         */
        if (totalConsumption > 0) {

            allocations = distributeByConsumption(
                    households,
                    householdConsumption,
                    totalConsumption,
                    totalApartmentCost
            );

        } else {

            /*
             * Flat-area fallback.
             */
            allocations = distributeByFlatArea(
                    households,
                    totalApartmentCost
            );
        }

        /*
         * Update billing cycles.
         */
        for (Household household : households) {

            Double sharedCharge =
                    allocations.get(household.getId());

            if (sharedCharge == null) {
                sharedCharge = 0.0;
            }

            BillingCycle billingCycle =
                    billingCycleRepository
                            .findByHouseholdIdAndBillingMonthAndBillingYear(
                                    household.getId(),
                                    billingMonth,
                                    billingYear
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Billing cycle not found for household "
                                                    + household.getId()
                                                    + " for "
                                                    + billingMonth
                                                    + "/"
                                                    + billingYear
                                    )
                            );

            billingCycle.setSharedCharge(
                    sharedCharge
            );

            double waterCharge =
                    billingCycle.getWaterCharge() != null
                            ? billingCycle.getWaterCharge()
                            : 0.0;

            billingCycle.setTotalBill(
                    round(
                            waterCharge + sharedCharge
                    )
            );

            billingCycleRepository.save(
                    billingCycle
            );
        }

        return allocations;
    }

    private Map<Long, Double> distributeByConsumption(
            List<Household> households,
            Map<Long, Double> householdConsumption,
            double totalConsumption,
            double totalApartmentCost) {

        Map<Long, Double> allocations =
                new HashMap<>();

        for (Household household : households) {

            double consumption =
                    householdConsumption.getOrDefault(
                            household.getId(),
                            0.0
                    );

            double allocation =
                    (consumption / totalConsumption)
                            * totalApartmentCost;

            allocations.put(
                    household.getId(),
                    round(allocation)
            );
        }

        return allocations;
    }

    private Map<Long, Double> distributeByFlatArea(
            List<Household> households,
            double totalApartmentCost) {

        double totalArea = households.stream()
                .map(Household::getFlatArea)
                .filter(area ->
                        area != null && area > 0
                )
                .mapToDouble(Double::doubleValue)
                .sum();

        if (totalArea <= 0) {
            throw new IllegalArgumentException(
                    "Cannot distribute cost: no valid flat-area data available"
            );
        }

        Map<Long, Double> allocations =
                new HashMap<>();

        for (Household household : households) {

            double area =
                    household.getFlatArea() != null
                            ? household.getFlatArea()
                            : 0.0;

            double allocation =
                    (area / totalArea)
                            * totalApartmentCost;

            allocations.put(
                    household.getId(),
                    round(allocation)
            );
        }

        return allocations;
    }

    private void validateBillingPeriod(
            Long apartmentId,
            Integer billingMonth,
            Integer billingYear) {

        if (apartmentId == null || apartmentId <= 0) {
            throw new IllegalArgumentException(
                    "Apartment ID must be valid"
            );
        }

        if (billingMonth == null
                || billingMonth < 1
                || billingMonth > 12) {

            throw new IllegalArgumentException(
                    "Billing month must be between 1 and 12"
            );
        }

        if (billingYear == null || billingYear <= 0) {
            throw new IllegalArgumentException(
                    "Billing year must be valid"
            );
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}