package com.infosys.water_management.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.water_management.dto.Request.HouseholdRequest;
import com.infosys.water_management.dto.Request.MeterConfigRequest;
import com.infosys.water_management.dto.Response.HouseholdResponse;
import com.infosys.water_management.service.HouseholdService;
import com.infosys.water_management.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(HouseholdController.class)
@AutoConfigureMockMvc(addFilters = false)
public class HouseholdControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private HouseholdService householdService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private com.infosys.water_management.repository.UserRepository userRepository;

    @Test
    void testCreateHouseholdApi() throws Exception {
        HouseholdRequest request = HouseholdRequest.builder()
                .flatNumber("A101")
                .floorNumber(1)
                .occupancy(4)
                .flatArea(1200.0)
                .apartmentId(1L)
                .build();

        HouseholdResponse response = HouseholdResponse.builder()
                .id(10L)
                .flatNumber("A101")
                .meterStatus("NOT_CONFIGURED")
                .status("ACTIVE")
                .build();

        when(householdService.createHousehold(any(HouseholdRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/households")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.flatNumber").value("A101"));
    }

    @Test
    void testConfigureMeterApi() throws Exception {
        MeterConfigRequest request = MeterConfigRequest.builder()
                .meterNumber("WM-GV-101")
                .meterInstallationDate(LocalDate.of(2026, 8, 1))
                .build();

        HouseholdResponse response = HouseholdResponse.builder()
                .id(10L)
                .flatNumber("A101")
                .meterNumber("WM-GV-101")
                .meterStatus("INSTALLED")
                .build();

        when(householdService.configureMeter(eq(10L), any(MeterConfigRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/households/10/meter")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meterNumber").value("WM-GV-101"))
                .andExpect(jsonPath("$.meterStatus").value("INSTALLED"));
    }
}
