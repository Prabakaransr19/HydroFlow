package com.infosys.water_management.config;

import com.infosys.water_management.model.*;
import com.infosys.water_management.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
@Profile("dev")
public class DataInitializer {

    @Bean
    CommandLineRunner init(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ApartmentRepository apartmentRepository,
            HouseholdRepository householdRepository,
            TariffPlanRepository tariffPlanRepository,
            WaterUsageRepository waterUsageRepository,
            BillingCycleRepository billingCycleRepository,
            WaterPurchaseRepository waterPurchaseRepository,
            InvoiceRepository invoiceRepository,
            AlertRepository alertRepository,
            ResidentInvitationRepository residentInvitationRepository) {

        return args -> {

                        alertRepository.deleteAllInBatch();
                        invoiceRepository.deleteAllInBatch();
                        billingCycleRepository.deleteAllInBatch();
                        waterUsageRepository.deleteAllInBatch();
                        waterPurchaseRepository.deleteAllInBatch();
                        tariffPlanRepository.deleteAllInBatch();
                        residentInvitationRepository.deleteAllInBatch();
                        userRepository.deleteAllInBatch();
                        householdRepository.deleteAllInBatch();
                        apartmentRepository.deleteAllInBatch();

            System.out.println("======================================");
            System.out.println("Initializing Demo Data");
            System.out.println("======================================");

            // ---------------------------------------------------------
            // SUPER ADMIN
            // ---------------------------------------------------------

            User superAdmin = userRepository
                    .findByEmail("admin@water.com")
                    .orElseGet(() ->
                            userRepository.save(
                                    User.builder()
                                            .name("Super Admin")
                                            .email("admin@water.com")
                                            .password(
                                                    passwordEncoder.encode(
                                                            "Admin@123"
                                                    )
                                            )
                                            .role(Role.SUPER_ADMIN)
                                            .status(Status.APPROVED)
                                            .build()
                            )
                    );

            // ---------------------------------------------------------
            // COMMUNITY ADMIN
            // ---------------------------------------------------------

            User communityAdmin = userRepository
                    .findByEmail("community@water.com")
                    .orElseGet(() ->
                            userRepository.save(
                                    User.builder()
                                            .name("Green Valley Admin")
                                            .email("community@water.com")
                                            .password(
                                                    passwordEncoder.encode(
                                                            "Admin@123"
                                                    )
                                            )
                                            .role(Role.COMMUNITY_ADMIN)
                                            .status(Status.APPROVED)
                                            .build()
                            )
                    );

            // ---------------------------------------------------------
            // PENDING COMMUNITY ADMIN
            // ---------------------------------------------------------

            if (!userRepository.existsByEmail(
                    "pending@water.com")) {

                userRepository.save(
                        User.builder()
                                .name("Pending Community Admin")
                                .email("pending@water.com")
                                .password(
                                        passwordEncoder.encode(
                                                "Admin@123"
                                        )
                                )
                                .role(Role.COMMUNITY_ADMIN)
                                .status(Status.PENDING)
                                .build()
                );
            }

            // ---------------------------------------------------------
            // APARTMENT
            // ---------------------------------------------------------

            Apartment apartment =
                    apartmentRepository.findAll()
                            .stream()
                            .filter(a ->
                                    "Green Valley Residency"
                                            .equals(a.getName()))
                            .findFirst()
                            .orElseGet(() ->
                                    apartmentRepository.save(
                                            Apartment.builder()
                                                    .name(
                                                            "Green Valley Residency"
                                                    )
                                                    .address(
                                                            "100 Lake View Road"
                                                    )
                                                    .city("Chennai")
                                                    .state("Tamil Nadu")
                                                    .pincode("600001")
                                                    .totalFlats(100)
                                                    .build()
                                    )
                            );

            communityAdmin.setApartment(apartment);
            userRepository.save(communityAdmin);

            // ---------------------------------------------------------
            // HOUSEHOLDS
            // ---------------------------------------------------------

            List<Household> households =
                    householdRepository.findByApartmentId(
                            apartment.getId()
                    );

            if (households.size() < 4) {

                householdRepository.save(
                        Household.builder()
                                .flatNumber("A101")
                                .floorNumber(1)
                                .occupancy(3)
                                .flatArea(1200.0)
                                .meterNumber("MTR-A101")
                                .meterInstalledDate(
                                        LocalDate.now().minusMonths(6)
                                )
                                .status("ACTIVE")
                                .apartment(apartment)
                                .build()
                );

                householdRepository.save(
                        Household.builder()
                                .flatNumber("A102")
                                .floorNumber(1)
                                .occupancy(4)
                                .flatArea(1350.0)
                                .meterNumber("MTR-A102")
                                .meterInstalledDate(
                                        LocalDate.now().minusMonths(6)
                                )
                                .status("ACTIVE")
                                .apartment(apartment)
                                .build()
                );

                householdRepository.save(
                        Household.builder()
                                .flatNumber("A103")
                                .floorNumber(1)
                                .occupancy(2)
                                .flatArea(1000.0)
                                .meterNumber("MTR-A103")
                                .meterInstalledDate(
                                        LocalDate.now().minusMonths(6)
                                )
                                .status("ACTIVE")
                                .apartment(apartment)
                                .build()
                );

                householdRepository.save(
                        Household.builder()
                                .flatNumber("A104")
                                .floorNumber(1)
                                .occupancy(5)
                                .flatArea(1500.0)
                                .meterNumber("MTR-A104")
                                .meterInstalledDate(
                                        LocalDate.now().minusMonths(6)
                                )
                                .status("ACTIVE")
                                .apartment(apartment)
                                .build()
                );

                households =
                        householdRepository.findByApartmentId(
                                apartment.getId()
                        );
            }

            Household h1 = households.get(0);
            Household h2 = households.get(1);
            Household h3 = households.get(2);
            Household h4 = households.get(3);

            // ---------------------------------------------------------
            // RESIDENT USERS
            // ---------------------------------------------------------

            createResident(
                    userRepository,
                    passwordEncoder,
                    "Arun Kumar",
                    "resident1@water.com",
                    apartment,
                    h1
            );

            createResident(
                    userRepository,
                    passwordEncoder,
                    "Priya Sharma",
                    "resident2@water.com",
                    apartment,
                    h2
            );

            createResident(
                    userRepository,
                    passwordEncoder,
                    "Rahul Kumar",
                    "resident3@water.com",
                    apartment,
                    h3
            );

            createResident(
                    userRepository,
                    passwordEncoder,
                    "Sneha Raj",
                    "resident4@water.com",
                    apartment,
                    h4
            );

            // ---------------------------------------------------------
            // TARIFF PLAN
            // ---------------------------------------------------------

            Tariffplan tariffPlan;

            if (tariffPlanRepository.count() == 0) {

                tariffPlan =
                        tariffPlanRepository.save(
                                Tariffplan.builder()
                                        .planName(
                                                "Standard Residential Plan"
                                        )
                                        .tier1Limit(10.0)
                                        .tier1Rate(15.0)
                                        .tier2Limit(20.0)
                                        .tier2Rate(25.0)
                                        .tier3Rate(40.0)
                                        .effectiveFrom(
                                                LocalDate.of(
                                                        2026,
                                                        1,
                                                        1
                                                )
                                        )
                                        .active(true)
                                        .apartment(apartment)
                                        .build()
                        );

            } else {

                tariffPlan =
                        tariffPlanRepository.findAll().get(0);
            }

            // ---------------------------------------------------------
            // WATER USAGE
            // ---------------------------------------------------------

            if (waterUsageRepository.count() == 0) {

                User r1 = userRepository
                        .findByEmail("resident1@water.com")
                        .orElse(null);

                User r2 = userRepository
                        .findByEmail("resident2@water.com")
                        .orElse(null);

                User r3 = userRepository
                        .findByEmail("resident3@water.com")
                        .orElse(null);

                User r4 = userRepository
                        .findByEmail("resident4@water.com")
                        .orElse(null);

                LocalDate today = LocalDate.now();

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h1)
                                .enteredBy(r1)
                                .readingDate(today.minusDays(6))
                                .meterReading(1000.0)
                                .waterConsumed(18.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h1)
                                .enteredBy(r1)
                                .readingDate(today.minusDays(5))
                                .meterReading(1018.0)
                                .waterConsumed(19.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h1)
                                .enteredBy(r1)
                                .readingDate(today.minusDays(4))
                                .meterReading(1037.0)
                                .waterConsumed(17.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h2)
                                .enteredBy(r2)
                                .readingDate(today.minusDays(6))
                                .meterReading(2000.0)
                                .waterConsumed(22.0)
                                .remarks("High usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h2)
                                .enteredBy(r2)
                                .readingDate(today.minusDays(5))
                                .meterReading(2022.0)
                                .waterConsumed(24.0)
                                .remarks("High usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h2)
                                .enteredBy(r2)
                                .readingDate(today.minusDays(4))
                                .meterReading(2046.0)
                                .waterConsumed(25.0)
                                .remarks("High usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h3)
                                .enteredBy(r3)
                                .readingDate(today.minusDays(6))
                                .meterReading(3000.0)
                                .waterConsumed(10.0)
                                .remarks("Low usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h3)
                                .enteredBy(r3)
                                .readingDate(today.minusDays(5))
                                .meterReading(3010.0)
                                .waterConsumed(11.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h3)
                                .enteredBy(r3)
                                .readingDate(today.minusDays(4))
                                .meterReading(3021.0)
                                .waterConsumed(10.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h4)
                                .enteredBy(r4)
                                .readingDate(today.minusDays(6))
                                .meterReading(4000.0)
                                .waterConsumed(12.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h4)
                                .enteredBy(r4)
                                .readingDate(today.minusDays(5))
                                .meterReading(4012.0)
                                .waterConsumed(13.0)
                                .remarks("Normal usage")
                                .build()
                );

                waterUsageRepository.save(
                        WaterUsageLog.builder()
                                .household(h4)
                                .enteredBy(r4)
                                .readingDate(today.minusDays(4))
                                .meterReading(4025.0)
                                .waterConsumed(45.0)
                                .remarks("Unusually high usage")
                                .build()
                );
            }

            // ---------------------------------------------------------
            // WATER PURCHASE
            // ---------------------------------------------------------

            if (waterPurchaseRepository.count() == 0) {

                waterPurchaseRepository.save(
                        WaterPurchase.builder()
                                .purchaseType("TANKER")
                                .purchasedVolume(10000.0)
                                .unitCost(2.50)
                                .totalCost(25000.0)
                                .purchaseDate(LocalDate.now())
                                .supplier("ABC Water Supply")
                                .remarks(
                                        "Emergency tanker supply"
                                )
                                .apartment(apartment)
                                .build()
                );
            }

            // ---------------------------------------------------------
            // BILLING CYCLES
            // ---------------------------------------------------------

            if (billingCycleRepository.count() == 0) {

                billingCycleRepository.save(
                        createBillingCycle(
                                h1,
                                tariffPlan,
                                8,
                                2026,
                                18.0,
                                270.0,
                                2500.0
                        )
                );

                billingCycleRepository.save(
                        createBillingCycle(
                                h2,
                                tariffPlan,
                                8,
                                2026,
                                24.0,
                                500.0,
                                6000.0
                        )
                );

                billingCycleRepository.save(
                        createBillingCycle(
                                h3,
                                tariffPlan,
                                8,
                                2026,
                                10.0,
                                150.0,
                                2000.0
                        )
                );

                billingCycleRepository.save(
                        createBillingCycle(
                                h4,
                                tariffPlan,
                                8,
                                2026,
                                45.0,
                                1250.0,
                                4500.0
                        )
                );
            }

            // ---------------------------------------------------------
            // ALERTS
            // ---------------------------------------------------------

            if (alertRepository.count() == 0) {

                alertRepository.save(
                        new Alert(
                                h2,
                                "OVERUSE",
                                "Water usage has exceeded the configured threshold.",
                                24.0,
                                20.0
                        )
                );

                alertRepository.save(
                        new Alert(
                                h4,
                                "ANOMALY",
                                "Unusually high water consumption detected.",
                                45.0,
                                25.0
                        )
                );
            }

            System.out.println();
            System.out.println("======================================");
            System.out.println("DEMO DATA READY");
            System.out.println("======================================");
            System.out.println();
            System.out.println(
                    "Super Admin : admin@water.com / Admin@123"
            );
            System.out.println(
                    "Community   : community@water.com / Admin@123"
            );
            System.out.println(
                    "Resident 1  : resident1@water.com / Admin@123"
            );
            System.out.println(
                    "Resident 2  : resident2@water.com / Admin@123"
            );
            System.out.println(
                    "Resident 3  : resident3@water.com / Admin@123"
            );
            System.out.println(
                    "Resident 4  : resident4@water.com / Admin@123"
            );
            System.out.println();
        };
    }

    private void createResident(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String name,
            String email,
            Apartment apartment,
            Household household) {

        User resident = userRepository
                .findByEmail(email)
                .orElseGet(() ->
                        User.builder()
                                .name(name)
                                .email(email)
                                .password(
                                        passwordEncoder.encode(
                                                "Admin@123"
                                        )
                                )
                                .role(Role.RESIDENT)
                                .status(Status.APPROVED)
                                .apartment(apartment)
                                .household(household)
                                .build()
                );

        resident.setApartment(apartment);
        resident.setHousehold(household);

        userRepository.save(resident);
    }

    private BillingCycle createBillingCycle(
            Household household,
            Tariffplan tariffPlan,
            Integer month,
            Integer year,
            Double consumption,
            Double waterCharge,
            Double sharedCharge) {

        return BillingCycle.builder()
                .billingMonth(month)
                .billingYear(year)
                .totalConsumption(consumption)
                .waterCharge(waterCharge)
                .sharedCharge(sharedCharge)
                .totalBill(
                        waterCharge + sharedCharge
                )
                .dueDate(
                        LocalDate.of(
                                year,
                                month,
                                15
                        )
                )
                .paymentStatus("PENDING")
                .status(BillingCycleStatus.OPEN)
                .household(household)
                .tariffPlan(tariffPlan)
                .build();
    }
}