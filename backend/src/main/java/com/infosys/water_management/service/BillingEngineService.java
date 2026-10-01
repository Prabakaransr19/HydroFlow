package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.BillingCalculationRequest;
import com.infosys.water_management.dto.Response.BillingCalculationResponse;
import com.infosys.water_management.dto.Response.BulkBillingResponse;
import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.Tariffplan;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.BillingCycleRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.TariffPlanRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class BillingEngineService {

    private final HouseholdRepository householdRepository;
    private final BillingCycleRepository billingCycleRepository;
    private final WaterUsageRepository waterUsageRepository;
    private final TariffPlanRepository tariffPlanRepository;
    private final TariffCalculationService tariffCalculationService;

    public BillingEngineService(
            HouseholdRepository householdRepository,
            BillingCycleRepository billingCycleRepository,
            WaterUsageRepository waterUsageRepository,
            TariffPlanRepository tariffPlanRepository,
            TariffCalculationService tariffCalculationService) {

        this.householdRepository = householdRepository;
        this.billingCycleRepository = billingCycleRepository;
        this.waterUsageRepository = waterUsageRepository;
        this.tariffPlanRepository = tariffPlanRepository;
        this.tariffCalculationService = tariffCalculationService;
    }

    @Transactional
    public BillingCalculationResponse calculateBill(BillingCalculationRequest request) {

        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new RuntimeException("Household not found with id: " + request.getHouseholdId()));

        BillingCycle billingCycle;
        if (request.getBillingCycleId() != null) {
            billingCycle = billingCycleRepository.findById(request.getBillingCycleId())
                .orElseThrow(() -> new RuntimeException("Billing cycle not found with id: " + request.getBillingCycleId()));
        } else {
            Integer month = request.getBillingMonth() != null ? request.getBillingMonth() : LocalDate.now().getMonthValue();
            Integer year = request.getBillingYear() != null ? request.getBillingYear() : LocalDate.now().getYear();
            billingCycle = billingCycleRepository.findAll().stream()
                .filter(cycle -> household.getId().equals(cycle.getHousehold().getId())
                    && month.equals(cycle.getBillingMonth()) && year.equals(cycle.getBillingYear()))
                .findFirst()
                .orElseGet(() -> {
                    LocalDate dueDate = LocalDate.of(year, month, 1).plusMonths(1).withDayOfMonth(15);
                    BillingCycle newCycle = BillingCycle.builder()
                            .household(household)
                            .billingMonth(month)
                            .billingYear(year)
                            .totalConsumption(0.0)
                            .waterCharge(0.0)
                            .sharedCharge(0.0)
                            .totalBill(0.0)
                            .dueDate(dueDate)
                            .paymentStatus("PENDING")
                            .build();
                    return billingCycleRepository.save(newCycle);
                });
        }

        if (billingCycle.getHousehold() != null && !billingCycle.getHousehold().getId().equals(household.getId())) {
            throw new RuntimeException("Billing cycle does not belong to the household");
        }

        validateBillingPeriod(billingCycle.getBillingMonth(), billingCycle.getBillingYear());

        // Dynamic tariff resolution: check cycle tariff plan, or fallback to apartment tariff plan
        Tariffplan tariffPlan = billingCycle.getTariffPlan();
        if (tariffPlan == null && household.getApartment() != null) {
            tariffPlan = tariffPlanRepository.findByApartmentIdAndActiveTrue(household.getApartment().getId())
                    .orElse(null);
        }
        if (tariffPlan == null) {
            tariffPlan = Tariffplan.builder()
                    .planName("Default Dynamic Plan")
                    .tier1MaxKl(10.0)
                    .tier1Limit(10.0)
                    .tier1Rate(50.0)
                    .tier2MaxKl(25.0)
                    .tier2Limit(25.0)
                    .tier2Rate(75.0)
                    .tier3Rate(100.0)
                    .build();
        }

        validateBillingPeriod(billingCycle.getBillingMonth(), billingCycle.getBillingYear());

        double previousReading = waterUsageRepository.findByHouseholdIdOrderByReadingDateDesc(household.getId()).stream()
            .filter(log -> !billingCycle.getBillingMonth().equals(log.getBillingMonth())
                || !billingCycle.getBillingYear().equals(log.getBillingYear()))
            .findFirst()
            .map(WaterUsageLog::getMeterReading).orElse(0.0);

        Double rawCurrentReading = request.getCurrentReading();
        double currentReading;
        double consumption;

        if (rawCurrentReading == null) {
            consumption = billingCycle.getTotalConsumption() != null ? billingCycle.getTotalConsumption() : 0.0;
            currentReading = previousReading + consumption;
        } else if (rawCurrentReading < previousReading) {
            // User entered direct consumption volume (e.g. 20 kL) instead of cumulative meter index
            consumption = rawCurrentReading;
            currentReading = previousReading + consumption;
        } else {
            // User entered cumulative meter index (e.g. 140 kL when previous was 120 kL)
            currentReading = rawCurrentReading;
            consumption = currentReading - previousReading;
        }
        WaterUsageLog monthlyLog = waterUsageRepository.findByHouseholdIdAndBillingMonthAndBillingYear(
                household.getId(),
                billingCycle.getBillingMonth(),
                billingCycle.getBillingYear()
        ).orElseGet(() -> WaterUsageLog.builder().build());
        monthlyLog.setHousehold(household);
        monthlyLog.setBillingMonth(billingCycle.getBillingMonth());
        monthlyLog.setBillingYear(billingCycle.getBillingYear());
        monthlyLog.setReadingDate(LocalDate.now());
        monthlyLog.setPreviousReading(previousReading);
        monthlyLog.setMeterReading(currentReading);
        monthlyLog.setWaterConsumed(consumption);
        monthlyLog.setRemarks("Monthly billing meter reading");
        waterUsageRepository.save(monthlyLog);

        // Calculate tiered water charge dynamically
        double waterCharge = tariffCalculationService.calculateCharge(consumption, tariffPlan);

        billingCycle.setTotalConsumption(consumption);
        billingCycle.setWaterCharge(waterCharge);

        if (billingCycle.getSharedCharge() == null) {
            billingCycle.setSharedCharge(0.0);
        }

        double totalBill = waterCharge + billingCycle.getSharedCharge();
        billingCycle.setTotalBill(totalBill);
        billingCycle.setTariffPlan(tariffPlan);

        billingCycleRepository.save(billingCycle);

        return new BillingCalculationResponse(
                household.getId(),
                billingCycle.getId(),
                billingCycle.getBillingMonth(),
                billingCycle.getBillingYear(),
                consumption,
                waterCharge,
                billingCycle.getSharedCharge(),
                totalBill
        );
    }

    @Transactional
    public BulkBillingResponse calculateAllPending(Long apartmentId, Integer billingMonth, Integer billingYear) {
        validateBillingPeriod(billingMonth, billingYear);

        if (apartmentId == null || apartmentId <= 0) {
            throw new IllegalArgumentException("Apartment ID must be valid");
        }

        List<Household> households = householdRepository.findByApartmentId(apartmentId);
        int totalHouseholds = households.size();
        int billedCount = 0;
        int skippedCount = 0;
        int noReadingCount = 0;

        Tariffplan tariffPlan = tariffPlanRepository.findByApartmentIdAndActiveTrue(apartmentId).orElse(null);
        if (tariffPlan == null) {
            tariffPlan = Tariffplan.builder()
                    .planName("Default Dynamic Plan")
                    .tier1MaxKl(10.0).tier1Limit(10.0).tier1Rate(50.0)
                    .tier2MaxKl(25.0).tier2Limit(25.0).tier2Rate(75.0)
                    .tier3Rate(100.0)
                    .build();
        }

        LocalDate dueDate = LocalDate.of(billingYear, billingMonth, 1).plusMonths(1).withDayOfMonth(15);

        for (Household household : households) {
            Optional<WaterUsageLog> logOpt = waterUsageRepository.findByHouseholdIdAndBillingMonthAndBillingYear(
                    household.getId(), billingMonth, billingYear
            );

            if (logOpt.isEmpty()) {
                noReadingCount++;
                continue;
            }

            boolean alreadyBilled = billingCycleRepository.existsByHouseholdIdAndBillingMonthAndBillingYear(
                    household.getId(), billingMonth, billingYear
            );

            if (alreadyBilled) {
                skippedCount++;
                continue;
            }

            WaterUsageLog log = logOpt.get();
            double consumption = log.getWaterConsumed();
            double waterCharge = tariffCalculationService.calculateCharge(consumption, tariffPlan);

            BillingCycle cycle = BillingCycle.builder()
                    .billingMonth(billingMonth)
                    .billingYear(billingYear)
                    .totalConsumption(consumption)
                    .waterCharge(waterCharge)
                    .sharedCharge(0.0)
                    .totalBill(waterCharge)
                    .dueDate(dueDate)
                    .paymentStatus("PENDING")
                    .household(household)
                    .tariffPlan(tariffPlan)
                    .build();

            billingCycleRepository.save(cycle);
            billedCount++;
        }

        String summaryMessage = String.format(
                "Bulk billing calculation completed: %d billed, %d skipped (already billed), %d pending readings.",
                billedCount, skippedCount, noReadingCount
        );

        return BulkBillingResponse.builder()
                .apartmentId(apartmentId)
                .billingMonth(billingMonth)
                .billingYear(billingYear)
                .totalHouseholds(totalHouseholds)
                .billedCount(billedCount)
                .skippedCount(skippedCount)
                .noReadingCount(noReadingCount)
                .message(summaryMessage)
                .build();
    }

    private void validateBillingPeriod(Integer billingMonth, Integer billingYear) {
        if (billingMonth == null || billingMonth < 1 || billingMonth > 12) {
            throw new IllegalArgumentException("Billing month must be between 1 and 12");
        }
        if (billingYear == null || billingYear < 2000) {
            throw new IllegalArgumentException("Billing year must be valid");
        }
    }
}