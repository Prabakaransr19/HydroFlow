package com.infosys.water_management.repository;

import com.infosys.water_management.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    List<Invoice> findByHouseholdId(Long householdId);

    List<Invoice> findByBillingCycleId(Long billingCycleId);

    Optional<Invoice> findByHouseholdIdAndBillingCycleId(
            Long householdId,
            Long billingCycleId
    );
}