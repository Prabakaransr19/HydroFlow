package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.ComplaintRequest;
import com.infosys.water_management.dto.Response.ComplaintResponse;
import com.infosys.water_management.model.Apartment;
import com.infosys.water_management.model.Complaint;
import com.infosys.water_management.model.Household;
import com.infosys.water_management.model.User;
import com.infosys.water_management.repository.ApartmentRepository;
import com.infosys.water_management.repository.ComplaintRepository;
import com.infosys.water_management.repository.HouseholdRepository;
import com.infosys.water_management.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    private static final Logger logger = LoggerFactory.getLogger(ComplaintService.class);

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final EmailService emailService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            UserRepository userRepository,
            HouseholdRepository householdRepository,
            ApartmentRepository apartmentRepository,
            EmailService emailService) {
        this.complaintRepository = complaintRepository;
        this.userRepository = userRepository;
        this.householdRepository = householdRepository;
        this.apartmentRepository = apartmentRepository;
        this.emailService = emailService;
    }

    @Transactional
    public ComplaintResponse raiseComplaint(ComplaintRequest request, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        Household household = user.getHousehold();
        if (household == null) {
            // Fallback: try to find first household if available
            household = householdRepository.findAll().stream().findFirst().orElse(null);
        }

        Apartment apartment = null;
        if (household != null && household.getApartment() != null) {
            apartment = household.getApartment();
        } else if (user.getApartment() != null) {
            apartment = user.getApartment();
        } else {
            apartment = apartmentRepository.findAll().stream().findFirst().orElse(null);
        }

        Complaint complaint = Complaint.builder()
                .household(household)
                .apartment(apartment)
                .raisedBy(user)
                .title(request.getTitle())
                .description(request.getDescription())
                .category(request.getCategory().toUpperCase())
                .status("OPEN")
                .createdAt(LocalDateTime.now())
                .build();

        Complaint saved = complaintRepository.save(complaint);
        return mapToResponse(saved);
    }

    public List<ComplaintResponse> getMyComplaints(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        if (user.getHousehold() == null) {
            return complaintRepository.findAll().stream()
                    .filter(c -> c.getRaisedBy() != null && c.getRaisedBy().getId().equals(user.getId()))
                    .map(this::mapToResponse)
                    .toList();
        }

        return complaintRepository.findByHouseholdIdOrderByCreatedAtDesc(user.getHousehold().getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ComplaintResponse> getApartmentComplaints(Long apartmentId, String status) {
        List<Complaint> complaints;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            complaints = complaintRepository.findByApartmentIdAndStatusOrderByCreatedAtDesc(apartmentId, status.toUpperCase());
        } else {
            complaints = complaintRepository.findByApartmentIdOrderByCreatedAtDesc(apartmentId);
        }
        return complaints.stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ComplaintResponse acknowledgeComplaint(Long complaintId, String adminNote, Authentication authentication) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + complaintId));

        String adminEmail = authentication != null ? authentication.getName() : null;
        User adminUser = adminEmail != null ? userRepository.findByEmail(adminEmail).orElse(null) : null;

        complaint.setStatus("ACKNOWLEDGED");
        complaint.setAdminNote(adminNote);
        complaint.setAcknowledgedBy(adminUser);
        complaint.setAcknowledgedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        try {
            if (saved.getRaisedBy() != null && saved.getRaisedBy().getEmail() != null) {
                String recipient = saved.getRaisedBy().getEmail();
                String subject = "HydroFlow - Complaint Acknowledged: " + saved.getTitle();
                String body = String.format(
                        "Hello %s,\n\nYour complaint titled '%s' (ID #%d) has been acknowledged by the Community Admin.\n\n" +
                        "Admin Note: %s\n\nStatus: ACKNOWLEDGED\nDate: %s\n\nThank you,\nHydroFlow Governance Team",
                        saved.getRaisedBy().getName(), saved.getTitle(), saved.getId(),
                        adminNote != null ? adminNote : "No notes provided.",
                        saved.getAcknowledgedAt()
                );
                emailService.sendSimpleEmail(recipient, subject, body);
            }
        } catch (Exception e) {
            logger.error("Failed to send complaint acknowledgment email to resident", e);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public ComplaintResponse resolveComplaint(Long complaintId, String adminNote, Authentication authentication) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found with ID: " + complaintId));

        complaint.setStatus("RESOLVED");
        if (adminNote != null && !adminNote.isBlank()) {
            complaint.setAdminNote(adminNote);
        }
        complaint.setResolvedAt(LocalDateTime.now());

        Complaint saved = complaintRepository.save(complaint);

        try {
            if (saved.getRaisedBy() != null && saved.getRaisedBy().getEmail() != null) {
                String recipient = saved.getRaisedBy().getEmail();
                String subject = "HydroFlow - Complaint Resolved: " + saved.getTitle();
                String body = String.format(
                        "Hello %s,\n\nYour complaint titled '%s' (ID #%d) has been resolved by the Community Admin.\n\n" +
                        "Admin Resolution Note: %s\n\nStatus: RESOLVED\nDate Resolved: %s\n\nThank you,\nHydroFlow Governance Team",
                        saved.getRaisedBy().getName(), saved.getTitle(), saved.getId(),
                        saved.getAdminNote() != null ? saved.getAdminNote() : "Resolved successfully.",
                        saved.getResolvedAt()
                );
                emailService.sendSimpleEmail(recipient, subject, body);
            }
        } catch (Exception e) {
            logger.error("Failed to send complaint resolution email to resident", e);
        }

        return mapToResponse(saved);
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        Household hh = c.getHousehold();
        Apartment apt = c.getApartment();
        User raised = c.getRaisedBy();
        User ack = c.getAcknowledgedBy();

        return ComplaintResponse.builder()
                .id(c.getId())
                .householdId(hh != null ? hh.getId() : null)
                .householdFlatNumber(hh != null ? hh.getFlatNumber() : "A101")
                .apartmentId(apt != null ? apt.getId() : null)
                .raisedById(raised != null ? raised.getId() : null)
                .raisedByName(raised != null ? raised.getName() : "Resident")
                .title(c.getTitle())
                .description(c.getDescription())
                .category(c.getCategory())
                .status(c.getStatus())
                .adminNote(c.getAdminNote())
                .acknowledgedById(ack != null ? ack.getId() : null)
                .acknowledgedByName(ack != null ? ack.getName() : null)
                .acknowledgedAt(c.getAcknowledgedAt())
                .resolvedAt(c.getResolvedAt())
                .createdAt(c.getCreatedAt())
                .build();
    }
}
