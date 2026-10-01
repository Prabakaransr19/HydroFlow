package com.infosys.water_management.repository;

import com.infosys.water_management.model.Role;
import com.infosys.water_management.model.Status;
import com.infosys.water_management.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByRoleAndStatus(Role role, Status status);
    List<User> findByRole(Role role);
    long countByRole(Role role);
    long countByRoleAndStatus(Role role, Status status);
}
