package com.infosys.water_management.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.water_management.dto.Request.ApartmentRequest;
import com.infosys.water_management.dto.Response.ApartmentResponse;
import com.infosys.water_management.service.ApartmentService;
import com.infosys.water_management.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ApartmentController.class)
@AutoConfigureMockMvc(addFilters = false)
public class ApartmentControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApartmentService apartmentService;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private com.infosys.water_management.repository.UserRepository userRepository;

    @Test
    void testCreateApartmentApi() throws Exception {
        ApartmentRequest request = ApartmentRequest.builder()
                .name("Green Valley Residency")
                .address("100 Waterworks Road")
                .city("Bengaluru")
                .state("Karnataka")
                .pincode("560100")
                .totalFlats(48)
                .build();

        ApartmentResponse response = ApartmentResponse.builder()
                .id(1L)
                .name("Green Valley Residency")
                .city("Bengaluru")
                .totalFlats(48)
                .build();

        when(apartmentService.createApartment(any(ApartmentRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/apartments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Green Valley Residency"));
    }

    @Test
    void testGetApartmentsApi() throws Exception {
        ApartmentResponse response = ApartmentResponse.builder()
                .id(1L)
                .name("Green Valley Residency")
                .build();

        when(apartmentService.getApartments()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/apartments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Green Valley Residency"));
    }
}
