package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.WaterReadingRequest;
import com.infosys.water_management.dto.Response.CsvUploadResponse;
import com.infosys.water_management.dto.Response.WaterReadingResponse;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.WaterUsageLog;
import com.infosys.water_management.repository.UserRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.WaterUsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class WaterUsageService {

    private final WaterUsageRepository waterUsageRepository;
    private final HouseholdRepository householdRepository;
    private final UserRepository userRepository;
    private final AlertService alertService;

    public WaterUsageService(WaterUsageRepository waterUsageRepository, HouseholdRepository householdRepository, UserRepository userRepository, AlertService alertService) {
        this.waterUsageRepository = waterUsageRepository;
        this.householdRepository = householdRepository;
        this.userRepository = userRepository;
        this.alertService = alertService;
    }

    public WaterReadingResponse submitManualReading(WaterReadingRequest request) {
        Household household = householdRepository.findById(request.getHouseholdId())
                .orElseThrow(() -> new RuntimeException("Household not found: " + request.getHouseholdId()));

        Integer month = request.getBillingMonth();
        Integer year = request.getBillingYear();

        if (month == null || month < 1 || month > 12) {
            throw new IllegalArgumentException("Billing month must be between 1 and 12");
        }
        if (year == null || year < 2000) {
            throw new IllegalArgumentException("Billing year must be valid");
        }

        if (waterUsageRepository.existsByHouseholdIdAndBillingMonthAndBillingYear(request.getHouseholdId(), month, year)) {
            throw new RuntimeException("Duplicate reading error: Monthly water usage record already exists for " + month + "/" + year);
        }

        double consumption = request.getConsumption() != null ? request.getConsumption() : request.getMeterReading();
        if (consumption < 0) {
            throw new IllegalArgumentException("Water consumption cannot be negative");
        }

        WaterUsageLog log = WaterUsageLog.builder()
                .household(household)
                .billingMonth(month)
                .billingYear(year)
                .readingDate(request.getReadingDate() != null ? request.getReadingDate() : LocalDate.now())
                .previousReading(0.0)
                .meterReading(consumption)
                .waterConsumed(consumption)
                .remarks(request.getRemarks() != null ? request.getRemarks() : "Monthly Entry")
                .build();

        WaterUsageLog saved = waterUsageRepository.save(log);
        alertService.checkUsageThreshold(household.getId(), consumption, AlertService.DEFAULT_USAGE_THRESHOLD);
        alertService.checkAnomaly(household.getId(), consumption);
        return mapToResponse(saved);
    }

    public List<WaterReadingResponse> getReadings(Long householdId, Long apartmentId) {
        List<WaterUsageLog> logs;
        if (householdId != null) {
            logs = waterUsageRepository.findByHouseholdIdOrderByReadingDateDesc(householdId);
        } else if (apartmentId != null) {
            logs = waterUsageRepository.findByHouseholdApartmentId(apartmentId);
        } else {
            logs = waterUsageRepository.findAll();
        }
        return logs.stream().map(this::mapToResponse).toList();
    }

        public List<WaterReadingResponse> getReadingsForResident(String email) {
        Household household = userRepository.findByEmail(email)
            .map(user -> user.getHousehold())
            .orElse(null);
        if (household == null) return List.of();
        return waterUsageRepository.findByHouseholdIdOrderByReadingDateDesc(household.getId())
            .stream().map(this::mapToResponse).toList();
        }

    public CsvUploadResponse uploadUsageCSV(MultipartFile file) {
        List<CsvUploadResponse.ValidationErrorDetail> errors = new ArrayList<>();
        List<WaterReadingResponse> processed = new ArrayList<>();

        int totalRecords = 0;
        int successCount = 0;
        int failedCount = 0;
        int duplicateCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            int row = 0;
            while ((line = reader.readLine()) != null) {
                row++;
                if (row == 1 && (line.contains("flatNumber") || line.contains("billingMonth"))) {
                    continue; // Skip header row
                }
                if (line.trim().isEmpty()) continue;

                totalRecords++;
                String[] tokens = line.split(",");
                if (tokens.length < 4) {
                    failedCount++;
                    errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "format", "Expected format: flatNumber,billingMonth,billingYear,consumption"));
                    continue;
                }

                String flatNumber = tokens[0].trim();
                String monthStr = tokens[1].trim();
                String yearStr = tokens[2].trim();
                String readingStr = tokens[3].trim();
                String remarks = tokens.length > 4 ? tokens[4].trim() : "CSV Monthly Upload";

                try {
                    int month = Integer.parseInt(monthStr);
                    int year = Integer.parseInt(yearStr);
                    double consumption = Double.parseDouble(readingStr);

                    if (month < 1 || month > 12) {
                        failedCount++;
                        errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "billingMonth", "Month must be between 1 and 12"));
                        continue;
                    }
                    if (consumption < 0) {
                        failedCount++;
                        errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "consumption", "Consumption cannot be negative"));
                        continue;
                    }

                    Household household = householdRepository.findByFlatNumber(flatNumber).orElse(null);
                    if (household == null) {
                        failedCount++;
                        errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "flatNumber", "Household flat not found: " + flatNumber));
                        continue;
                    }

                    if (waterUsageRepository.existsByHouseholdIdAndBillingMonthAndBillingYear(household.getId(), month, year)) {
                        duplicateCount++;
                        errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "billingPeriod", "Duplicate entry for " + flatNumber + " in " + month + "/" + year));
                        continue;
                    }

                    WaterUsageLog log = WaterUsageLog.builder()
                            .household(household)
                            .billingMonth(month)
                            .billingYear(year)
                            .readingDate(LocalDate.now())
                            .previousReading(0.0)
                            .meterReading(consumption)
                            .waterConsumed(consumption)
                            .remarks(remarks)
                            .build();

                    WaterUsageLog saved = waterUsageRepository.save(log);
                    alertService.checkUsageThreshold(household.getId(), consumption, AlertService.DEFAULT_USAGE_THRESHOLD);
                    alertService.checkAnomaly(household.getId(), consumption);
                    processed.add(mapToResponse(saved));
                    successCount++;

                } catch (Exception parseErr) {
                    failedCount++;
                    errors.add(new CsvUploadResponse.ValidationErrorDetail(row, "data", "Parsing error: " + parseErr.getMessage()));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to read CSV file: " + e.getMessage());
        }

        return CsvUploadResponse.builder()
                .fileName(file.getOriginalFilename())
                .totalRecords(totalRecords)
                .successCount(successCount)
                .failedCount(failedCount)
                .duplicateCount(duplicateCount)
                .validationErrors(errors)
                .processedRecords(processed)
                .build();
    }

    private WaterReadingResponse mapToResponse(WaterUsageLog log) {
        return WaterReadingResponse.builder()
                .id(log.getId())
                .householdId(log.getHousehold() != null ? log.getHousehold().getId() : null)
                .flatNumber(log.getHousehold() != null ? log.getHousehold().getFlatNumber() : "N/A")
                .billingMonth(log.getBillingMonth())
                .billingYear(log.getBillingYear())
                .readingDate(log.getReadingDate())
                .previousReading(log.getPreviousReading())
                .currentReading(log.getCurrentReading())
                .waterConsumed(log.getWaterConsumed())
                .consumption(log.getConsumption())
                .remarks(log.getRemarks())
                .build();
    }
}
