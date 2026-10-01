package com.infosys.water_management.dto.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class TariffPlanRequest {

    private Long apartmentId;

    private String planName;

    @NotNull(message = "Tier 1 maximum volume is required")
    @Min(value = 1, message = "Tier 1 max volume must be at least 1 kL")
    private Double tier1MaxKl;

    @NotNull(message = "Tier 1 rate is required")
    @Min(value = 0, message = "Tier 1 rate cannot be negative")
    private Double tier1Rate;

    @NotNull(message = "Tier 2 maximum volume is required")
    @Min(value = 1, message = "Tier 2 max volume must be at least 1 kL")
    private Double tier2MaxKl;

    @NotNull(message = "Tier 2 rate is required")
    @Min(value = 0, message = "Tier 2 rate cannot be negative")
    private Double tier2Rate;

    @NotNull(message = "Tier 3 rate is required")
    @Min(value = 0, message = "Tier 3 rate cannot be negative")
    private Double tier3Rate;

    public TariffPlanRequest() {}

    public TariffPlanRequest(Long apartmentId, String planName, Double tier1MaxKl, Double tier1Rate, Double tier2MaxKl, Double tier2Rate, Double tier3Rate) {
        this.apartmentId = apartmentId;
        this.planName = planName;
        this.tier1MaxKl = tier1MaxKl;
        this.tier1Rate = tier1Rate;
        this.tier2MaxKl = tier2MaxKl;
        this.tier2Rate = tier2Rate;
        this.tier3Rate = tier3Rate;
    }

    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public Double getTier1MaxKl() { return tier1MaxKl; }
    public void setTier1MaxKl(Double tier1MaxKl) { this.tier1MaxKl = tier1MaxKl; }

    public Double getTier1Rate() { return tier1Rate; }
    public void setTier1Rate(Double tier1Rate) { this.tier1Rate = tier1Rate; }

    public Double getTier2MaxKl() { return tier2MaxKl; }
    public void setTier2MaxKl(Double tier2MaxKl) { this.tier2MaxKl = tier2MaxKl; }

    public Double getTier2Rate() { return tier2Rate; }
    public void setTier2Rate(Double tier2Rate) { this.tier2Rate = tier2Rate; }

    public Double getTier3Rate() { return tier3Rate; }
    public void setTier3Rate(Double tier3Rate) { this.tier3Rate = tier3Rate; }
}
