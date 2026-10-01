package com.infosys.water_management.repository;

import com.infosys.water_management.model.BillingCycle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BillingCycleRepository
        extends JpaRepository<BillingCycle, Long> {

    boolean existsByHouseholdIdAndBillingMonthAndBillingYear(
            Long householdId,
            Integer billingMonth,
            Integer billingYear
    );

    Optional<BillingCycle> findByHouseholdIdAndBillingMonthAndBillingYear(
            Long householdId,
            Integer billingMonth,
            Integer billingYear
    );

    java.util.List<BillingCycle> findByApartmentId(Long apartmentId);
    long countByStatus(com.infosys.water_management.model.BillingCycleStatus status);
}