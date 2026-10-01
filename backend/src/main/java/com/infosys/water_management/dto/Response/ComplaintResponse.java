package com.infosys.water_management.dto.Response;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComplaintResponse {

    private Long id;
    private Long householdId;
    private String householdFlatNumber;
    private Long apartmentId;
    private Long raisedById;
    private String raisedByName;
    private String title;
    private String description;
    private String category;
    private String status;
    private String adminNote;
    private Long acknowledgedById;
    private String acknowledgedByName;
    private LocalDateTime acknowledgedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
}
