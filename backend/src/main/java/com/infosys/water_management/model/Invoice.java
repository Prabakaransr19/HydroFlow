package com.infosys.water_management.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "invoices",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"household_id", "billing_cycle_id"}
                )
        }
)
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "household_id", nullable = false)
    private Household household;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "billing_cycle_id", nullable = false, unique = true)
    private BillingCycle billingCycle;

    @Column(nullable = false)
    private Double consumption;

    @Column(nullable = false)
    private Double baseWaterCharge;

    @Column(nullable = false)
    private Double sharedAreaCharge;

    @Column(nullable = false)
    private Double adjustments;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private LocalDateTime generatedAt;

    @Column(nullable = false)
    private String status = "UNPAID";

    private LocalDateTime paidAt;

    private String paymentReference;

    private String paymentMethod;

    public Invoice() {}

    public Invoice(Long id, Household household, BillingCycle billingCycle, Double consumption, Double baseWaterCharge, Double sharedAreaCharge, Double adjustments, Double totalAmount, LocalDateTime generatedAt, String status, LocalDateTime paidAt, String paymentReference, String paymentMethod) {
        this.id = id;
        this.household = household;
        this.billingCycle = billingCycle;
        this.consumption = consumption;
        this.baseWaterCharge = baseWaterCharge;
        this.sharedAreaCharge = sharedAreaCharge;
        this.adjustments = adjustments;
        this.totalAmount = totalAmount;
        this.generatedAt = generatedAt;
        this.status = status != null ? status : "UNPAID";
        this.paidAt = paidAt;
        this.paymentReference = paymentReference;
        this.paymentMethod = paymentMethod;
    }

    @PrePersist
    public void prePersist() {
        if (generatedAt == null) {
            generatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "UNPAID";
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Household getHousehold() { return household; }
    public void setHousehold(Household household) { this.household = household; }

    public BillingCycle getBillingCycle() { return billingCycle; }
    public void setBillingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; }

    public Double getConsumption() { return consumption; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }

    public Double getBaseWaterCharge() { return baseWaterCharge; }
    public void setBaseWaterCharge(Double baseWaterCharge) { this.baseWaterCharge = baseWaterCharge; }

    public Double getSharedAreaCharge() { return sharedAreaCharge; }
    public void setSharedAreaCharge(Double sharedAreaCharge) { this.sharedAreaCharge = sharedAreaCharge; }

    public Double getAdjustments() { return adjustments; }
    public void setAdjustments(Double adjustments) { this.adjustments = adjustments; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public static InvoiceBuilder builder() { return new InvoiceBuilder(); }

    public static class InvoiceBuilder {
        private Long id;
        private Household household;
        private BillingCycle billingCycle;
        private Double consumption;
        private Double baseWaterCharge;
        private Double sharedAreaCharge;
        private Double adjustments;
        private Double totalAmount;
        private LocalDateTime generatedAt;
        private String status = "UNPAID";
        private LocalDateTime paidAt;
        private String paymentReference;
        private String paymentMethod;

        public InvoiceBuilder id(Long id) { this.id = id; return this; }
        public InvoiceBuilder household(Household household) { this.household = household; return this; }
        public InvoiceBuilder billingCycle(BillingCycle billingCycle) { this.billingCycle = billingCycle; return this; }
        public InvoiceBuilder consumption(Double consumption) { this.consumption = consumption; return this; }
        public InvoiceBuilder baseWaterCharge(Double baseWaterCharge) { this.baseWaterCharge = baseWaterCharge; return this; }
        public InvoiceBuilder sharedAreaCharge(Double sharedAreaCharge) { this.sharedAreaCharge = sharedAreaCharge; return this; }
        public InvoiceBuilder adjustments(Double adjustments) { this.adjustments = adjustments; return this; }
        public InvoiceBuilder totalAmount(Double totalAmount) { this.totalAmount = totalAmount; return this; }
        public InvoiceBuilder generatedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; return this; }
        public InvoiceBuilder status(String status) { this.status = status; return this; }
        public InvoiceBuilder paidAt(LocalDateTime paidAt) { this.paidAt = paidAt; return this; }
        public InvoiceBuilder paymentReference(String paymentReference) { this.paymentReference = paymentReference; return this; }
        public InvoiceBuilder paymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; return this; }

        public Invoice build() {
            return new Invoice(id, household, billingCycle, consumption, baseWaterCharge, sharedAreaCharge, adjustments, totalAmount, generatedAt, status, paidAt, paymentReference, paymentMethod);
        }
    }
}