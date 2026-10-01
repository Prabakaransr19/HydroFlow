package com.infosys.water_management.repository;

import com.infosys.water_management.model.WaterPurchase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WaterPurchaseRepository
        extends JpaRepository<WaterPurchase, Long> {

    List<WaterPurchase> findByApartmentIdOrderByPurchaseDateDesc(
            Long apartmentId
    );

    List<WaterPurchase> findByApartmentIdAndPurchaseDateBetween(
            Long apartmentId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<WaterPurchase> findByBillingCycleId(
            Long billingCycleId
    );
}