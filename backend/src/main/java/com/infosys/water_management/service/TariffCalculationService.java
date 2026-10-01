package com.infosys.water_management.service;

import com.infosys.water_management.model.Tariffplan;
import org.springframework.stereotype.Service;

@Service
public class TariffCalculationService {

    /**
     * Calculates the water charge based on the configured
     * three-tier tariff plan.
     *
     * Tier 1:
     * 0 -> tier1Limit
     *
     * Tier 2:
     * tier1Limit -> tier2Limit
     *
     * Tier 3:
     * Above tier2Limit
     */
    public double calculateCharge(
            double consumption,
            Tariffplan tariffPlan) {

        if (consumption < 0) {
            throw new IllegalArgumentException(
                    "Consumption cannot be negative"
            );
        }

        if (tariffPlan == null) {
            throw new IllegalArgumentException(
                    "Tariff plan is required"
            );
        }

        validateTariffPlan(tariffPlan);

        double charge = 0.0;

        // Tier 1
        double tier1Consumption =
                Math.min(consumption, tariffPlan.getTier1Limit());

        charge += tier1Consumption * tariffPlan.getTier1Rate();

        // Tier 2
        if (consumption > tariffPlan.getTier1Limit()) {

            double tier2Consumption =
                    Math.min(
                            consumption - tariffPlan.getTier1Limit(),
                            tariffPlan.getTier2Limit()
                                    - tariffPlan.getTier1Limit()
                    );

            charge += tier2Consumption
                    * tariffPlan.getTier2Rate();
        }

        // Tier 3
        if (consumption > tariffPlan.getTier2Limit()) {

            double tier3Consumption =
                    consumption - tariffPlan.getTier2Limit();

            charge += tier3Consumption
                    * tariffPlan.getTier3Rate();
        }

        return Math.round(charge * 100.0) / 100.0;
    }

    private void validateTariffPlan(Tariffplan tariffPlan) {

        if (tariffPlan.getTier1Limit() == null
                || tariffPlan.getTier1Limit() <= 0) {

            throw new IllegalArgumentException(
                    "Tier 1 limit must be greater than zero"
            );
        }

        if (tariffPlan.getTier2Limit() == null
                || tariffPlan.getTier2Limit()
                <= tariffPlan.getTier1Limit()) {

            throw new IllegalArgumentException(
                    "Tier 2 limit must be greater than Tier 1 limit"
            );
        }

        if (tariffPlan.getTier1Rate() == null
                || tariffPlan.getTier1Rate() < 0) {

            throw new IllegalArgumentException(
                    "Tier 1 rate cannot be negative"
            );
        }

        if (tariffPlan.getTier2Rate() == null
                || tariffPlan.getTier2Rate() < 0) {

            throw new IllegalArgumentException(
                    "Tier 2 rate cannot be negative"
            );
        }

        if (tariffPlan.getTier3Rate() == null
                || tariffPlan.getTier3Rate() < 0) {

            throw new IllegalArgumentException(
                    "Tier 3 rate cannot be negative"
            );
        }
    }
}