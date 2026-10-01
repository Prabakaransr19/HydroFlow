package com.infosys.water_management.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdResponse {

    private Long id;
    private Long apartmentId;
    private String flatNumber;
    private Integer floorNumber;
    private Integer occupancy;
    private Double flatArea;
    private String meterNumber;
    private LocalDate meterInstallationDate;
    private String meterStatus;
    private String status;
    private String residentName;
    private String residentEmail;
}
