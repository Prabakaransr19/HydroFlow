package com.infosys.water_management.dto.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CommunityAdminSetupRequest {
    private Long apartmentId;
    private ApartmentRequest apartment;
}
