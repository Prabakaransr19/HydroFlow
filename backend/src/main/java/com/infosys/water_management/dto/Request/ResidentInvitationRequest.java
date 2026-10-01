package com.infosys.water_management.dto.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ResidentInvitationRequest {

    private String residentName;
    private String email;

}