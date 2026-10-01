package com.infosys.water_management.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_cycles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingCycle {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillingCycleStatus status;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer billingMonth;

    private Integer billingYear;

    private Double totalConsumption;

    private Double waterCharge;

    private Double sharedCharge;

    private Double totalBill;

    private LocalDate dueDate;

    private String paymentStatus;

    private LocalDateTime generatedAt;

    @ManyToOne
    @JoinColumn(name = "apartment_id")
    @JsonIgnoreProperties({"households", "users", "tariffPlans"})
    private Apartment apartment;

    @ManyToOne
    @JoinColumn(name = "household_id", nullable = false)
    @JsonIgnoreProperties({"billingCycles", "waterUsageLogs", "users", "apartment"})
    private Household household;

    @ManyToOne
    @JoinColumn(name = "tariff_plan_id", nullable = false)
    @JsonIgnoreProperties({"apartment"})
    private Tariffplan tariffPlan;

    @PrePersist
    public void prePersist() {
        generatedAt = LocalDateTime.now();

        if (status == null) {
            status = BillingCycleStatus.OPEN;
        }
    }
}