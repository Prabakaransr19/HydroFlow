package com.infosys.water_management.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResidentInvitationResponse {

    private String message;
    private String token;
    private String invitationLink;
    private String residentName;
    private String email;
    private String status;

    public ResidentInvitationResponse(String message, String token, String invitationLink) {
        this.message = message;
        this.token = token;
        this.invitationLink = invitationLink;
    }
}