package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.BillingCalculationRequest;
import com.infosys.water_management.dto.Response.BillingCalculationResponse;
import com.infosys.water_management.model.BillingCycle;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.Tariffplan;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.BillingCycleRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BillingEngineServiceTest {

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private BillingCycleRepository billingCycleRepository;

    @Mock
    private WaterUsageRepository waterUsageRepository;

    @org.mockito.Spy
    private TariffCalculationService tariffCalculationService = new TariffCalculationService();

    @InjectMocks
    private BillingEngineService billingEngineService;

    private Household household;
    private BillingCycle billingCycle;
    private Tariffplan tariffPlan;

    @BeforeEach
    void setUp() {
        household = Household.builder().id(1L).flatNumber("A101").build();
        tariffPlan = Tariffplan.builder().id(10L).tier1Limit(10.0).tier1Rate(50.0).tier2Limit(25.0).tier2Rate(75.0).tier3Rate(100.0).build();
        billingCycle = BillingCycle.builder().id(100L).household(household).tariffPlan(tariffPlan).billingMonth(8).billingYear(2026).build();
    }

    @Test
    void testCalculateBillSuccess() {
        BillingCalculationRequest request = new BillingCalculationRequest(1L, 100L);
        request.setCurrentReading(120.0);

        WaterUsageLog log = WaterUsageLog.builder()
                .household(household)
                .billingMonth(7)
                .billingYear(2026)
                .readingDate(LocalDate.of(2026, 7, 15))
                .meterReading(100.0)
                .waterConsumed(20.0)
                .build();

        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(billingCycleRepository.findById(100L)).thenReturn(Optional.of(billingCycle));
        when(waterUsageRepository.findByHouseholdIdOrderByReadingDateDesc(1L))
                .thenReturn(List.of(log));

        BillingCalculationResponse response = billingEngineService.calculateBill(request);

        assertNotNull(response);
        assertEquals(20.0, response.getConsumption());
        assertEquals(1250.0, response.getWaterCharge());
        verify(billingCycleRepository, times(1)).save(any(BillingCycle.class));
    }
}
