package com.infosys.water_management.dto.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HouseholdRequest {

    @NotBlank(message = "Flat number is required")
    private String flatNumber;

    @NotNull(message = "Floor number is required")
    private Integer floorNumber;

    @NotNull(message = "Occupancy count is required")
    @Min(value = 1, message = "Occupancy must be at least 1")
    private Integer occupancy;

    @NotNull(message = "Flat area is required")
    @Min(value = 100, message = "Flat area must be at least 100 sq ft")
    private Double flatArea;

    private Long apartmentId;
    private LocalDate meterInstallationDate;
}
