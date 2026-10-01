package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.HouseholdRequest;
import com.infosys.water_management.dto.Request.MeterConfigRequest;
import com.infosys.water_management.dto.Request.ResidentAssignmentRequest;
import com.infosys.water_management.dto.Response.HouseholdResponse;
import com.infosys.water_management.model.Apartment;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.User;
import com.infosys.water_management.repository.ApartmentRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class HouseholdService {

    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;

    public HouseholdService(
            HouseholdRepository householdRepository,
            ApartmentRepository apartmentRepository,
            UserRepository userRepository) {
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public HouseholdResponse createHousehold(HouseholdRequest request) {
        Long aptId = request.getApartmentId();
        Apartment apartment = null;
        if (aptId != null) {
            apartment = apartmentRepository.findById(aptId).orElse(null);
        }
        if (apartment == null) {
            apartment = apartmentRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new RuntimeException("No residential apartment complex found."));
        }

        long count = householdRepository.countByApartmentId(apartment.getId());
        String generatedMeterNumber = String.format("APT%d-%03d", apartment.getId(), count + 1);

        Household household = Household.builder()
                .apartment(apartment)
                .flatNumber(request.getFlatNumber())
                .floorNumber(request.getFloorNumber())
                .occupancy(request.getOccupancy())
                .flatArea(request.getFlatArea())
                .meterNumber(generatedMeterNumber)
                .meterInstalledDate(request.getMeterInstallationDate() != null ? request.getMeterInstallationDate() : LocalDate.now())
                .status("ACTIVE")
                .build();

        Household saved = householdRepository.save(household);
        return mapToResponse(saved);
    }

    public List<HouseholdResponse> getHouseholds(Long apartmentId) {
        List<Household> households = (apartmentId != null)
                ? householdRepository.findByApartmentId(apartmentId)
                : householdRepository.findAll();

        return households.stream().map(this::mapToResponse).toList();
    }

    public HouseholdResponse getHouseholdById(Long id) {
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Household not found with ID: " + id));
        return mapToResponse(household);
    }

    public HouseholdResponse updateHousehold(Long id, HouseholdRequest request) {
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Household not found with ID: " + id));

        household.setFlatNumber(request.getFlatNumber());
        household.setFloorNumber(request.getFloorNumber());
        household.setOccupancy(request.getOccupancy());
        household.setFlatArea(request.getFlatArea());

        Household saved = householdRepository.save(household);
        return mapToResponse(saved);
    }

    public HouseholdResponse configureMeter(Long householdId, MeterConfigRequest request) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new RuntimeException("Household not found with ID: " + householdId));

        if (request.getMeterInstallationDate() != null) {
            household.setMeterInstalledDate(request.getMeterInstallationDate());
        }
        household.setStatus("ACTIVE");

        Household saved = householdRepository.save(household);
        return mapToResponse(saved);
    }

    public HouseholdResponse assignResident(Long householdId, ResidentAssignmentRequest request) {
        Household household = householdRepository.findById(householdId)
                .orElseThrow(() -> new RuntimeException("Household not found with ID: " + householdId));

        User user = userRepository.findByEmail(request.getResidentEmail()).orElse(null);
        if (user != null) {
            user.setHousehold(household);
            userRepository.save(user);
        }

        return mapToResponse(household);
    }

    private HouseholdResponse mapToResponse(Household household) {
        String residentName = "Unassigned";
        String residentEmail = "";

        if (household.getUsers() != null && !household.getUsers().isEmpty()) {
            User primary = household.getUsers().get(0);
            residentName = primary.getName();
            residentEmail = primary.getEmail();
        }

        boolean hasMeter = household.getMeterNumber() != null && !household.getMeterNumber().equals("NOT_CONFIGURED");

        return HouseholdResponse.builder()
                .id(household.getId())
                .apartmentId(household.getApartment() != null ? household.getApartment().getId() : null)
                .flatNumber(household.getFlatNumber())
                .floorNumber(household.getFloorNumber())
                .occupancy(household.getOccupancy())
                .flatArea(household.getFlatArea())
                .meterNumber(household.getMeterNumber())
                .meterInstallationDate(household.getMeterInstalledDate())
                .meterStatus(hasMeter ? "INSTALLED" : "NOT_CONFIGURED")
                .status(household.getStatus() != null ? household.getStatus() : "ACTIVE")
                .residentName(residentName)
                .residentEmail(residentEmail)
                .build();
    }
}
