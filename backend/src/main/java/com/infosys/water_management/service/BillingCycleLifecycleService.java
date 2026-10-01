package com.infosys.water_management.service;

import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.BillingCycleStatus;
import com.infosys.water_management.repository.BillingCycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BillingCycleLifecycleService {

    private final BillingCycleRepository billingCycleRepository;

    public BillingCycleLifecycleService(
            BillingCycleRepository billingCycleRepository) {

        this.billingCycleRepository = billingCycleRepository;
    }

    @Transactional
    public BillingCycle finalizeBillingCycle(Long billingCycleId) {

        BillingCycle billingCycle =
                billingCycleRepository
                        .findById(billingCycleId)
                        .orElseThrow(() -> new RuntimeException(
                                "Billing cycle not found with id: "
                                        + billingCycleId
                        ));

        if (billingCycle.getStatus()
                != BillingCycleStatus.OPEN) {

            throw new IllegalStateException(
                    "Only OPEN billing cycles can be finalized"
            );
        }

        if (billingCycle.getTotalConsumption() == null
                || billingCycle.getWaterCharge() == null) {

            throw new IllegalStateException(
                    "Billing must be calculated before finalizing"
            );
        }

        if (billingCycle.getTotalBill() == null) {
            throw new IllegalStateException(
                    "Total bill must be calculated before finalizing"
            );
        }

        billingCycle.setStatus(
                BillingCycleStatus.FINALIZED
        );

        return billingCycleRepository.save(
                billingCycle
        );
    }

    @Transactional
    public BillingCycle archiveBillingCycle(Long billingCycleId) {

        BillingCycle billingCycle =
                billingCycleRepository
                        .findById(billingCycleId)
                        .orElseThrow(() -> new RuntimeException(
                                "Billing cycle not found with id: "
                                        + billingCycleId
                        ));

        if (billingCycle.getStatus()
                != BillingCycleStatus.FINALIZED) {

            throw new IllegalStateException(
                    "Only FINALIZED billing cycles can be archived"
            );
        }

        billingCycle.setStatus(
                BillingCycleStatus.ARCHIVED
        );

        return billingCycleRepository.save(
                billingCycle
        );
    }
}