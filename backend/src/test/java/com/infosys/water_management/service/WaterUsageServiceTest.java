package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.WaterReadingRequest;
import com.infosys.water_management.dto.Response.WaterReadingResponse;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WaterUsageServiceTest {

    @Mock
    private WaterUsageRepository waterUsageRepository;

    @Mock
    private HouseholdRepository householdRepository;

    @Mock
    private AlertService alertService;

    @InjectMocks
    private WaterUsageService waterUsageService;

    private Household household;

    @BeforeEach
    void setUp() {
        household = Household.builder().id(1L).flatNumber("A101").build();
    }

    @Test
    void testSubmitManualReadingSuccess() {
        LocalDate date = LocalDate.of(2026, 8, 1);
        WaterReadingRequest request = WaterReadingRequest.builder()
                .householdId(1L)
                .billingMonth(8)
                .billingYear(2026)
                .readingDate(date)
                .meterReading(120.0)
                .remarks("Monthly Check")
                .build();

        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(waterUsageRepository.existsByHouseholdIdAndBillingMonthAndBillingYear(1L, 8, 2026)).thenReturn(false);
        when(waterUsageRepository.save(any(WaterUsageLog.class))).thenAnswer(i -> {
            WaterUsageLog log = i.getArgument(0);
            log.setId(10L);
            return log;
        });

        WaterReadingResponse response = waterUsageService.submitManualReading(request);

        assertNotNull(response);
        assertEquals("A101", response.getFlatNumber());
        assertEquals(120.0, response.getCurrentReading());
        assertEquals(120.0, response.getWaterConsumed());
        verify(alertService).checkUsageThreshold(eq(1L), eq(120.0), anyDouble());
        verify(alertService).checkAnomaly(eq(1L), eq(120.0));
    }

    @Test
    void testSubmitManualReadingDuplicateThrowsException() {
        LocalDate date = LocalDate.of(2026, 8, 1);
        WaterReadingRequest request = WaterReadingRequest.builder()
                .householdId(1L)
                .billingMonth(8)
                .billingYear(2026)
                .readingDate(date)
                .meterReading(120.0)
                .build();

        when(householdRepository.findById(1L)).thenReturn(Optional.of(household));
        when(waterUsageRepository.existsByHouseholdIdAndBillingMonthAndBillingYear(1L, 8, 2026)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> waterUsageService.submitManualReading(request));
    }
}
