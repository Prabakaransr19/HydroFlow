package com.infosys.water_management.repository;

import com.infosys.water_management.model.ResidentInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResidentInvitationRepository
        extends JpaRepository<ResidentInvitation, Long> {

    Optional<ResidentInvitation> findByToken(String token);

    Optional<ResidentInvitation> findByEmail(String email);

    boolean existsByEmail(String email);
}