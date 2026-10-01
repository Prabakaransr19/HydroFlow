package com.infosys.water_management.repository;

import com.infosys.water_management.model.Tariffplan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TariffPlanRepository extends JpaRepository<Tariffplan, Long> {

    List<Tariffplan> findByApartmentId(Long apartmentId);

    Optional<Tariffplan> findByApartmentIdAndActiveTrue(Long apartmentId);

    List<Tariffplan> findByActiveTrue();
}