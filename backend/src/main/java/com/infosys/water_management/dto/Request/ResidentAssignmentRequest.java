package com.infosys.water_management.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentAssignmentRequest {

    @NotBlank(message = "Resident name is required")
    private String residentName;

    @NotBlank(message = "Resident email is required")
    @Email(message = "Invalid email format")
    private String residentEmail;
}
