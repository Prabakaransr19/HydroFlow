package com.infosys.water_management.dto.Request;

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
public class MeterConfigRequest {

    private String meterNumber;

    @NotNull(message = "Meter installation date is required")
    private LocalDate meterInstallationDate;
}
