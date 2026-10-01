package com.infosys.water_management.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tariff_plans")
public class Tariffplan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String planName;

    @Column(name = "tier1_max_kl")
    private Double tier1MaxKl;

    private Double tier1Limit;

    private Double tier1Rate;

    @Column(name = "tier2_max_kl")
    private Double tier2MaxKl;

    private Double tier2Limit;

    private Double tier2Rate;

    private Double tier3Rate;

    private LocalDate effectiveFrom;

    private Boolean active;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = true)
    private Apartment apartment;

    public Tariffplan() {}

    public Tariffplan(Long id, String planName, Double tier1MaxKl, Double tier1Limit, Double tier1Rate, Double tier2MaxKl, Double tier2Limit, Double tier2Rate, Double tier3Rate, LocalDate effectiveFrom, Boolean active, Apartment apartment) {
        this.id = id;
        this.planName = planName;
        this.tier1MaxKl = tier1MaxKl != null ? tier1MaxKl : tier1Limit;
        this.tier1Limit = this.tier1MaxKl;
        this.tier1Rate = tier1Rate;
        this.tier2MaxKl = tier2MaxKl != null ? tier2MaxKl : tier2Limit;
        this.tier2Limit = this.tier2MaxKl;
        this.tier2Rate = tier2Rate;
        this.tier3Rate = tier3Rate;
        this.effectiveFrom = effectiveFrom;
        this.active = active;
        this.apartment = apartment;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPlanName() { return planName; }
    public void setPlanName(String planName) { this.planName = planName; }

    public Double getTier1MaxKl() { return tier1MaxKl != null ? tier1MaxKl : tier1Limit; }
    public void setTier1MaxKl(Double tier1MaxKl) { this.tier1MaxKl = tier1MaxKl; this.tier1Limit = tier1MaxKl; }

    public Double getTier1Limit() { return getTier1MaxKl(); }
    public void setTier1Limit(Double tier1Limit) { setTier1MaxKl(tier1Limit); }

    public Double getTier1Rate() { return tier1Rate; }
    public void setTier1Rate(Double tier1Rate) { this.tier1Rate = tier1Rate; }

    public Double getTier2MaxKl() { return tier2MaxKl != null ? tier2MaxKl : tier2Limit; }
    public void setTier2MaxKl(Double tier2MaxKl) { this.tier2MaxKl = tier2MaxKl; this.tier2Limit = tier2MaxKl; }

    public Double getTier2Limit() { return getTier2MaxKl(); }
    public void setTier2Limit(Double tier2Limit) { setTier2MaxKl(tier2Limit); }

    public Double getTier2Rate() { return tier2Rate; }
    public void setTier2Rate(Double tier2Rate) { this.tier2Rate = tier2Rate; }

    public Double getTier3Rate() { return tier3Rate; }
    public void setTier3Rate(Double tier3Rate) { this.tier3Rate = tier3Rate; }

    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Apartment getApartment() { return apartment; }
    public void setApartment(Apartment apartment) { this.apartment = apartment; }

    public static TariffplanBuilder builder() { return new TariffplanBuilder(); }

    public static class TariffplanBuilder {
        private Long id;
        private String planName;
        private Double tier1MaxKl;
        private Double tier1Limit;
        private Double tier1Rate;
        private Double tier2MaxKl;
        private Double tier2Limit;
        private Double tier2Rate;
        private Double tier3Rate;
        private LocalDate effectiveFrom;
        private Boolean active;
        private Apartment apartment;

        public TariffplanBuilder id(Long id) { this.id = id; return this; }
        public TariffplanBuilder planName(String planName) { this.planName = planName; return this; }
        public TariffplanBuilder tier1MaxKl(Double tier1MaxKl) { this.tier1MaxKl = tier1MaxKl; return this; }
        public TariffplanBuilder tier1Limit(Double tier1Limit) { this.tier1Limit = tier1Limit; return this; }
        public TariffplanBuilder tier1Rate(Double tier1Rate) { this.tier1Rate = tier1Rate; return this; }
        public TariffplanBuilder tier2MaxKl(Double tier2MaxKl) { this.tier2MaxKl = tier2MaxKl; return this; }
        public TariffplanBuilder tier2Limit(Double tier2Limit) { this.tier2Limit = tier2Limit; return this; }
        public TariffplanBuilder tier2Rate(Double tier2Rate) { this.tier2Rate = tier2Rate; return this; }
        public TariffplanBuilder tier3Rate(Double tier3Rate) { this.tier3Rate = tier3Rate; return this; }
        public TariffplanBuilder effectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; return this; }
        public TariffplanBuilder active(Boolean active) { this.active = active; return this; }
        public TariffplanBuilder apartment(Apartment apartment) { this.apartment = apartment; return this; }

        public Tariffplan build() {
            return new Tariffplan(id, planName, tier1MaxKl, tier1Limit, tier1Rate, tier2MaxKl, tier2Limit, tier2Rate, tier3Rate, effectiveFrom, active, apartment);
        }
    }
}