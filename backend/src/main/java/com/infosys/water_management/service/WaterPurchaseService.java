package com.infosys.water_management.service;

import com.infosys.water_management.model.Apartment;
import com.infosys.water_management.model.WaterPurchase;
import com.infosys.water_management.repository.ApartmentRepository;
import com.infosys.water_management.repository.WaterPurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class WaterPurchaseService {

    private final WaterPurchaseRepository waterPurchaseRepository;
    private final ApartmentRepository apartmentRepository;

    public WaterPurchaseService(
            WaterPurchaseRepository waterPurchaseRepository,
            ApartmentRepository apartmentRepository) {

        this.waterPurchaseRepository = waterPurchaseRepository;
        this.apartmentRepository = apartmentRepository;
    }

    @Transactional
    public WaterPurchase createPurchase(
            Long apartmentId,
            String purchaseType,
            Double purchasedVolume,
            Double unitCost,
            LocalDate purchaseDate,
            String supplier,
            String remarks) {

        validatePurchase(
                apartmentId,
                purchaseType,
                purchasedVolume,
                unitCost,
                purchaseDate
        );

        Apartment apartment = apartmentRepository
                .findById(apartmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Apartment not found with id: "
                                + apartmentId
                ));

        double totalCost =
                purchasedVolume * unitCost;

        WaterPurchase purchase = WaterPurchase.builder()
                .purchaseType(purchaseType)
                .purchasedVolume(purchasedVolume)
                .unitCost(unitCost)
                .totalCost(totalCost)
                .purchaseDate(purchaseDate)
                .supplier(supplier)
                .remarks(remarks)
                .apartment(apartment)
                .build();

        return waterPurchaseRepository.save(purchase);
    }

    @Transactional(readOnly = true)
    public List<WaterPurchase> getApartmentPurchases(
            Long apartmentId) {

        if (apartmentId == null || apartmentId <= 0) {
            throw new IllegalArgumentException(
                    "Apartment ID must be valid"
            );
        }

        apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException(
                        "Apartment not found with id: "
                                + apartmentId
                ));

        return waterPurchaseRepository
                .findByApartmentIdOrderByPurchaseDateDesc(
                        apartmentId
                );
    }

    @Transactional(readOnly = true)
    public List<WaterPurchase> getPurchasesForBillingCycle(
            Long billingCycleId) {

        if (billingCycleId == null || billingCycleId <= 0) {
            throw new IllegalArgumentException(
                    "Billing cycle ID must be valid"
            );
        }

        return waterPurchaseRepository
                .findByBillingCycleId(billingCycleId);
    }

    @Transactional(readOnly = true)
    public double calculateTotalPurchaseCost(
            Long apartmentId,
            LocalDate startDate,
            LocalDate endDate) {

        if (apartmentId == null || apartmentId <= 0) {
            throw new IllegalArgumentException(
                    "Apartment ID must be valid"
            );
        }

        if (startDate == null || endDate == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }

        List<WaterPurchase> purchases =
                waterPurchaseRepository
                        .findByApartmentIdAndPurchaseDateBetween(
                                apartmentId,
                                startDate,
                                endDate
                        );

        return purchases.stream()
                .map(WaterPurchase::getTotalCost)
                .filter(cost -> cost != null && cost >= 0)
                .mapToDouble(Double::doubleValue)
                .sum();
    }

    private void validatePurchase(
            Long apartmentId,
            String purchaseType,
            Double purchasedVolume,
            Double unitCost,
            LocalDate purchaseDate) {

        if (apartmentId == null || apartmentId <= 0) {
            throw new IllegalArgumentException(
                    "Apartment ID must be valid"
            );
        }

        if (purchaseType == null
                || purchaseType.isBlank()) {

            throw new IllegalArgumentException(
                    "Purchase type is required"
            );
        }

        if (purchasedVolume == null
                || purchasedVolume <= 0) {

            throw new IllegalArgumentException(
                    "Purchased volume must be greater than zero"
            );
        }

        if (unitCost == null || unitCost < 0) {
            throw new IllegalArgumentException(
                    "Unit cost cannot be negative"
            );
        }

        if (purchaseDate == null) {
            throw new IllegalArgumentException(
                    "Purchase date is required"
            );
        }
    }
}