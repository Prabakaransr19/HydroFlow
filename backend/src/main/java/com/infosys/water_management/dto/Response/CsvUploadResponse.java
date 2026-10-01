package com.infosys.water_management.dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CsvUploadResponse {

    private String fileName;
    private int totalRecords;
    private int successCount;
    private int failedCount;
    private int duplicateCount;
    private List<ValidationErrorDetail> validationErrors;
    private List<WaterReadingResponse> processedRecords;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ValidationErrorDetail {
        private int row;
        private String field;
        private String message;
    }
}
