package com.infosys.water_management.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "apartments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Apartment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false)
    private String pincode;

    @Column(nullable = false)
    private Integer totalFlats;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"apartment", "households", "users", "waterUsageLogs", "billingCycles"})
    private List<Household> households;

    @OneToMany(mappedBy = "apartment")
    @JsonIgnoreProperties({"apartment", "household", "users", "password"})
    private List<User> users;

    @OneToMany(mappedBy = "apartment", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"apartment"})
    private List<Tariffplan> tariffPlans;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}