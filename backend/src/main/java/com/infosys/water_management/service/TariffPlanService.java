package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.TariffPlanRequest;
import com.infosys.water_management.dto.Response.TariffPlanResponse;
import com.infosys.water_management.model.Apartment;
import com.infosys.water_management.model.Tariffplan;
import com.infosys.water_management.repository.ApartmentRepository;
import com.infosys.water_management.repository.TariffPlanRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class TariffPlanService {

    private final TariffPlanRepository tariffPlanRepository;
    private final ApartmentRepository apartmentRepository;

    public TariffPlanService(TariffPlanRepository tariffPlanRepository, ApartmentRepository apartmentRepository) {
        this.tariffPlanRepository = tariffPlanRepository;
        this.apartmentRepository = apartmentRepository;
    }

    public TariffPlanResponse getTariffPlanByApartmentId(Long apartmentId) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found with ID: " + apartmentId));

        Tariffplan plan = tariffPlanRepository.findByApartmentIdAndActiveTrue(apartmentId)
                .orElseGet(() -> createDefaultTariffPlan(apartment));

        return mapToResponse(plan);
    }

    public TariffPlanResponse saveOrUpdateTariffPlan(TariffPlanRequest request) {
        if (request.getTier1MaxKl() == null || request.getTier2MaxKl() == null) {
            throw new IllegalArgumentException("Tier 1 and Tier 2 limits are required");
        }
        if (request.getTier1MaxKl() >= request.getTier2MaxKl()) {
            throw new IllegalArgumentException("Tier 1 maximum limit must be strictly less than Tier 2 maximum limit");
        }
        if (request.getTier1Rate() < 0 || request.getTier2Rate() < 0 || request.getTier3Rate() < 0) {
            throw new IllegalArgumentException("Tariff rates cannot be negative");
        }

        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new RuntimeException("Apartment not found with ID: " + request.getApartmentId()));

        Tariffplan plan = tariffPlanRepository.findByApartmentIdAndActiveTrue(request.getApartmentId())
                .orElse(new Tariffplan());

        plan.setApartment(apartment);
        plan.setPlanName(request.getPlanName() != null ? request.getPlanName() : apartment.getName() + " Tariff Plan");
        plan.setTier1MaxKl(request.getTier1MaxKl());
        plan.setTier1Rate(request.getTier1Rate());
        plan.setTier2MaxKl(request.getTier2MaxKl());
        plan.setTier2Rate(request.getTier2Rate());
        plan.setTier3Rate(request.getTier3Rate());
        plan.setActive(true);
        if (plan.getEffectiveFrom() == null) {
            plan.setEffectiveFrom(LocalDate.now());
        }

        Tariffplan saved = tariffPlanRepository.save(plan);
        return mapToResponse(saved);
    }

    private Tariffplan createDefaultTariffPlan(Apartment apartment) {
        Tariffplan defaultPlan = Tariffplan.builder()
                .apartment(apartment)
                .planName(apartment.getName() + " Default Tariff Plan")
                .tier1MaxKl(10.0)
                .tier1Limit(10.0)
                .tier1Rate(50.0)
                .tier2MaxKl(25.0)
                .tier2Limit(25.0)
                .tier2Rate(75.0)
                .tier3Rate(100.0)
                .effectiveFrom(LocalDate.now())
                .active(true)
                .build();
        return tariffPlanRepository.save(defaultPlan);
    }

    private TariffPlanResponse mapToResponse(Tariffplan plan) {
        return new TariffPlanResponse(
                plan.getId(),
                plan.getApartment() != null ? plan.getApartment().getId() : null,
                plan.getApartment() != null ? plan.getApartment().getName() : "General",
                plan.getPlanName(),
                plan.getTier1MaxKl(),
                plan.getTier1Rate(),
                plan.getTier2MaxKl(),
                plan.getTier2Rate(),
                plan.getTier3Rate(),
                plan.getEffectiveFrom(),
                plan.getActive()
        );
    }
}
