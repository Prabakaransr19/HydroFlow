package com.infosys.water_management.repository;

import com.infosys.water_management.model.WaterUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WaterUsageRepository extends JpaRepository<WaterUsageLog, Long> {

    List<WaterUsageLog> findByHouseholdIdOrderByReadingDateAsc(Long householdId);

    List<WaterUsageLog> findByHouseholdIdOrderByReadingDateDesc(Long householdId);

    Optional<WaterUsageLog> findByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);

    Optional<WaterUsageLog> findTopByHouseholdIdOrderByReadingDateDesc(Long householdId);

    List<WaterUsageLog> findByHouseholdIdAndReadingDateBetween(Long householdId, LocalDate startDate, LocalDate endDate);

    boolean existsByHouseholdIdAndReadingDate(Long householdId, LocalDate readingDate);

    // Monthly query methods
    Optional<WaterUsageLog> findByHouseholdIdAndBillingMonthAndBillingYear(Long householdId, Integer billingMonth, Integer billingYear);

    boolean existsByHouseholdIdAndBillingMonthAndBillingYear(Long householdId, Integer billingMonth, Integer billingYear);

    List<WaterUsageLog> findByHouseholdApartmentIdAndBillingMonthAndBillingYear(Long apartmentId, Integer billingMonth, Integer billingYear);

    List<WaterUsageLog> findByHouseholdApartmentId(Long apartmentId);
}