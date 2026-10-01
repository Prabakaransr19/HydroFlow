package com.infosys.water_management.dto.Response;

import java.time.LocalDate;

public class TariffPlanResponse {

    private Long id;
    private Long apartmentId;
    private String apartmentName;
    private String planName;
    private Double tier1MaxKl;
    private Double tier1Rate;
    private Double tier2MaxKl;
    private Double tier2Rate;
    private Double tier3Rate;
    private LocalDate effectiveFrom;
    private Boolean active;

    public TariffPlanResponse() {}

    public TariffPlanResponse(Long id, Long apartmentId, String apartmentName, String planName, Double tier1MaxKl, Double tier1Rate, Double tier2MaxKl, Double tier2Rate, Double tier3Rate, LocalDate effectiveFrom, Boolean active) {
        this.id = id;
        this.apartmentId = apartmentId;
        this.apartmentName = apartmentName;
        this.planName = planName;
        this.tier1MaxKl = tier1MaxKl;
        this.tier1Rate = tier1Rate;
        this.tier2MaxKl = tier2MaxKl;
        this.tier2Rate = tier2Rate;
        this.tier3Rate = tier3Rate;
        this.effectiveFrom = effectiveFrom;
        this.active = active;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }

    public String getApartmentName() { return apartmentName; }
    public void setApartmentName(String apartmentName) { this.apartmentName = apartmentName; }

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

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
