package com.infosys.water_management.service;

import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.Tariffplan;
import com.infosys.water_management.repository.BillingCycleRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class BillingCycleService {

    private final BillingCycleRepository billingCycleRepository;
    private final HouseholdRepository householdRepository;
    private final TariffPlanRepository tariffPlanRepository;

    public BillingCycleService(
            BillingCycleRepository billingCycleRepository,
            HouseholdRepository householdRepository,
            TariffPlanRepository tariffPlanRepository) {

        this.billingCycleRepository = billingCycleRepository;
        this.householdRepository = householdRepository;
        this.tariffPlanRepository = tariffPlanRepository;
    }

    @Transactional
    public BillingCycle createBillingCycle(
            Long householdId,
            Integer billingMonth,
            Integer billingYear,
            LocalDate dueDate) {

        validateBillingPeriod(billingMonth, billingYear);

        if (householdId == null || householdId <= 0) {
            throw new IllegalArgumentException(
                    "Household ID must be valid"
            );
        }

        Household household = householdRepository
                .findById(householdId)
                .orElseThrow(() -> new RuntimeException(
                        "Household not found with id: "
                                + householdId
                ));

        if (household.getApartment() == null) {
            throw new IllegalArgumentException(
                    "Household is not associated with an apartment"
            );
        }

        Long apartmentId = household
                .getApartment()
                .getId();

        Tariffplan tariffPlan = tariffPlanRepository
                .findByApartmentIdAndActiveTrue(apartmentId)
                .orElseThrow(() -> new RuntimeException(
                        "No active tariff plan found for apartment"
                ));

        /*
         * Prevent duplicate billing cycles for the same
         * household and billing period.
         */
        boolean alreadyExists =
                billingCycleRepository
                        .existsByHouseholdIdAndBillingMonthAndBillingYear(
                                householdId,
                                billingMonth,
                                billingYear
                        );

        if (alreadyExists) {
            throw new IllegalArgumentException(
                    "Billing cycle already exists for household "
                            + householdId
                            + " for "
                            + billingMonth
                            + "/"
                            + billingYear
            );
        }

        BillingCycle billingCycle = BillingCycle.builder()
                .billingMonth(billingMonth)
                .billingYear(billingYear)
                .totalConsumption(0.0)
                .waterCharge(0.0)
                .sharedCharge(0.0)
                .totalBill(0.0)
                .dueDate(dueDate)
                .paymentStatus("PENDING")
                .household(household)
                .tariffPlan(tariffPlan)
                .build();

        return billingCycleRepository.save(billingCycle);
    }

    private void validateBillingPeriod(
            Integer billingMonth,
            Integer billingYear) {

        if (billingMonth == null
                || billingMonth < 1
                || billingMonth > 12) {

            throw new IllegalArgumentException(
                    "Billing month must be between 1 and 12"
            );
        }

        if (billingYear == null
                || billingYear < 2000) {

            throw new IllegalArgumentException(
                    "Billing year must be valid"
            );
        }
    }

    public java.util.List<BillingCycle> getBillingCycles(Long apartmentId) {
        if (apartmentId != null) {
            return billingCycleRepository.findByApartmentId(apartmentId);
        }
        return billingCycleRepository.findAll();
    }
}