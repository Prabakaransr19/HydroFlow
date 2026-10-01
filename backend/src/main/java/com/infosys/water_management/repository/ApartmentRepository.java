package com.infosys.water_management.repository;

import com.infosys.water_management.model.Apartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment , Long> {
}
