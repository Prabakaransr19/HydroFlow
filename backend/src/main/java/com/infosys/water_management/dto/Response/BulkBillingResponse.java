package com.infosys.water_management.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkBillingResponse {

    private Long apartmentId;
    private Integer billingMonth;
    private Integer billingYear;
    private int totalHouseholds;
    private int billedCount;
    private int skippedCount;
    private int noReadingCount;
    private String message;
}
