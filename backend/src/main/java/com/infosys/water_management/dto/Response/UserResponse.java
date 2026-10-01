package com.infosys.water_management.dto.Response;

import com.infosys.water_management.model.Role;
import com.infosys.water_management.model.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private Role role;
    private Status status;
    private String apartmentName;
    private Long apartmentId;
    private boolean requiresApartmentSetup;

    public UserResponse(Long id, String name, String email, Role role, Status status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.apartmentName = null;
    }

    public UserResponse(String name, String email, Role role, Status status) {
        this.name = name;
        this.email = email;
        this.role = role;
        this.status = status;
        this.apartmentName = null;
    }
}