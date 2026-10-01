package com.infosys.water_management.repository;

import com.infosys.water_management.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByApartmentIdOrderByCreatedAtDesc(Long apartmentId);
    List<Complaint> findByHouseholdIdOrderByCreatedAtDesc(Long householdId);
    List<Complaint> findByApartmentIdAndStatusOrderByCreatedAtDesc(Long apartmentId, String status);
}
