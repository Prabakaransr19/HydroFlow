package com.infosys.water_management.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "households")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Household {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String flatNumber;

    private Integer floorNumber;

    @Column(nullable = false)
    private Integer occupancy;

    private Double flatArea;

    @Column(unique = true)
    private String meterNumber;

    private LocalDate meterInstalledDate;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = false)
    @JsonIgnoreProperties({"households", "users", "tariffPlans"})
    private Apartment apartment;

    @OneToMany(mappedBy = "household")
    @JsonIgnoreProperties({"household", "apartment", "password"})
    private List<User> users;

    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"household", "enteredBy"})
    private List<WaterUsageLog> waterUsageLogs;

    @OneToMany(mappedBy = "household", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"household", "apartment", "tariffPlan"})
    private List<BillingCycle> billingCycles;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}