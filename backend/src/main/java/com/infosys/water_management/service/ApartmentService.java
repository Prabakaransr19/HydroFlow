package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.ApartmentRequest;
import com.infosys.water_management.dto.Response.ApartmentResponse;
import com.infosys.water_management.model.Apartment;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.Invoice;
import com.infosys.water_management.model.User;
import com.infosys.water_management.repository.ApartmentRepository;
import com.infosys.water_management.repository.InvoiceRepository;
import com.infosys.water_management.repository.UserRepository;
import com.infosys.water_management.repository.WaterPurchaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ApartmentService {

    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final WaterPurchaseRepository waterPurchaseRepository;
    private final InvoiceRepository invoiceRepository;

    public ApartmentService(
            ApartmentRepository apartmentRepository,
            UserRepository userRepository,
            WaterPurchaseRepository waterPurchaseRepository,
            InvoiceRepository invoiceRepository) {
        this.apartmentRepository = apartmentRepository;
        this.userRepository = userRepository;
        this.waterPurchaseRepository = waterPurchaseRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public ApartmentResponse createApartment(ApartmentRequest request) {

        Apartment apartment = Apartment.builder()
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .totalFlats(request.getTotalFlats())
                .build();

        Apartment saved = apartmentRepository.save(apartment);

        return ApartmentResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .city(saved.getCity())
                .state(saved.getState())
                .pincode(saved.getPincode())
                .totalFlats(saved.getTotalFlats())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<ApartmentResponse> getApartments() {
        return apartmentRepository.findAll().stream().map(saved ->
                ApartmentResponse.builder()
                        .id(saved.getId())
                        .name(saved.getName())
                        .address(saved.getAddress())
                        .city(saved.getCity())
                        .state(saved.getState())
                        .pincode(saved.getPincode())
                        .totalFlats(saved.getTotalFlats())
                        .createdAt(saved.getCreatedAt())
                        .build()
        ).toList();
    }

    public ApartmentResponse getApartmentById(Long id) {
        Apartment saved = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found: " + id));
        return ApartmentResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .city(saved.getCity())
                .state(saved.getState())
                .pincode(saved.getPincode())
                .totalFlats(saved.getTotalFlats())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public ApartmentResponse updateApartment(Long id, ApartmentRequest request) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found: " + id));
        apartment.setName(request.getName());
        apartment.setAddress(request.getAddress());
        apartment.setCity(request.getCity());
        apartment.setState(request.getState());
        apartment.setPincode(request.getPincode());
        apartment.setTotalFlats(request.getTotalFlats());

        Apartment saved = apartmentRepository.save(apartment);
        return ApartmentResponse.builder()
                .id(saved.getId())
                .name(saved.getName())
                .address(saved.getAddress())
                .city(saved.getCity())
                .state(saved.getState())
                .pincode(saved.getPincode())
                .totalFlats(saved.getTotalFlats())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteApartment(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Apartment not found: " + id));

        // 1. Unlink users assigned to this apartment
        userRepository.findAll().stream()
                .filter(u -> u.getApartment() != null && u.getApartment().getId().equals(id))
                .forEach(u -> {
                    u.setApartment(null);
                    u.setHousehold(null);
                    userRepository.save(u);
                });

        // 2. Process households and delete linked invoices
        if (apartment.getHouseholds() != null) {
            for (Household hh : apartment.getHouseholds()) {
                // Unlink users associated with this household unit
                userRepository.findAll().stream()
                        .filter(u -> u.getHousehold() != null && u.getHousehold().getId().equals(hh.getId()))
                        .forEach(u -> {
                            u.setHousehold(null);
                            userRepository.save(u);
                        });

                // Delete invoice records for this household
                List<Invoice> invoices = invoiceRepository.findByHouseholdId(hh.getId());
                if (!invoices.isEmpty()) {
                    invoiceRepository.deleteAll(invoices);
                }
            }
        }

        // 3. Delete water purchase records for this apartment
        waterPurchaseRepository.findByApartmentIdOrderByPurchaseDateDesc(id)
                .forEach(waterPurchaseRepository::delete);

        // 4. Delete the apartment entity (cascades to households, tariff plans)
        apartmentRepository.delete(apartment);
    }
}