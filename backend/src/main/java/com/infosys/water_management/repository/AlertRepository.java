package com.infosys.water_management.repository;

import com.infosys.water_management.model.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository
        extends JpaRepository<Alert, Long> {

    List<Alert>
    findByHouseholdIdOrderByCreatedAtDesc(
            Long householdId
    );

    List<Alert>
    findByHouseholdIdAndAcknowledgedFalseOrderByCreatedAtDesc(
            Long householdId
    );

    List<Alert>
    findByAcknowledgedFalse();

        List<Alert>
        findByAcknowledgedFalseOrderByCreatedAtDesc();

    boolean
    existsByHouseholdIdAndTypeAndAcknowledgedFalse(
            Long householdId,
            String type
    );
}