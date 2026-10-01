package com.infosys.water_management.dto.Request;

import com.infosys.water_management.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private Role role;

}