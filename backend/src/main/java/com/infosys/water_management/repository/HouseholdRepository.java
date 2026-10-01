package com.infosys.water_management.repository;

import com.infosys.water_management.model.Household;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HouseholdRepository extends JpaRepository<Household, Long> {

    List<Household> findByApartmentId(Long apartmentId);

    java.util.Optional<Household> findByFlatNumber(String flatNumber);

    long countByApartmentId(Long apartmentId);
}