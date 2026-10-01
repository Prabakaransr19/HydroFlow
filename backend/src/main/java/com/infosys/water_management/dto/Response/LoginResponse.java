package com.infosys.water_management.dto.Response;

import com.infosys.water_management.model.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class LoginResponse {

    private String token;
    private String message;
    private String name;
    private String email;
    private Role role;
    private UserResponse user;

    public LoginResponse(String token, String message, String name, String email, Role role) {
        this.token = token;
        this.message = message;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    // constructors, getters, setters
}