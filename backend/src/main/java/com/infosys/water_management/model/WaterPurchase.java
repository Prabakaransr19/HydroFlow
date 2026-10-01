package com.infosys.water_management.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_purchases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String purchaseType;

    @Column(nullable = false)
    private Double purchasedVolume;

    @Column(nullable = false)
    private Double unitCost;

    @Column(nullable = false)
    private Double totalCost;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    private String supplier;

    private String remarks;

    @ManyToOne
    @JoinColumn(name = "apartment_id", nullable = false)
    private Apartment apartment;

    @ManyToOne
    @JoinColumn(name = "billing_cycle_id")
    private BillingCycle billingCycle;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (totalCost == null
                && purchasedVolume != null
                && unitCost != null) {

            totalCost =
                    purchasedVolume * unitCost;
        }
    }
}