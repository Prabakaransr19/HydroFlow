package com.infosys.water_management.service;

import com.infosys.water_management.dto.Request.LoginRequest;
import com.infosys.water_management.dto.Response.LoginResponse;
import com.infosys.water_management.dto.Request.RegisterRequest;
import com.infosys.water_management.dto.Response.UserResponse;
import com.infosys.water_management.exception.AccountNotApprovedException;
import com.infosys.water_management.exception.DuplicateEmailException;
import com.infosys.water_management.exception.InvalidCredentialsException;
import com.infosys.water_management.exception.UserNotFoundException;
import com.infosys.water_management.model.*;
import com.infosys.water_management.repository.UserRepository;
import com.infosys.water_management.repository.ApartmentRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.infosys.water_management.dto.Request.ResidentInvitationRequest;
import com.infosys.water_management.dto.Response.ResidentInvitationResponse;
import com.infosys.water_management.repository.ResidentInvitationRepository;
import com.infosys.water_management.dto.Request.ResidentRegistrationRequest;
import com.infosys.water_management.dto.Request.CommunityAdminSetupRequest;
import com.infosys.water_management.model.InvitationStatus;
import com.infosys.water_management.model.ResidentInvitation;

import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Service
public class AuthService {
    @Value("${app.frontend-url}")
    private String frontendUrl;
    private final ResidentInvitationRepository residentInvitationRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApartmentRepository apartmentRepository;
    private final EmailService emailService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ResidentInvitationRepository residentInvitationRepository,
            ApartmentRepository apartmentRepository,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.residentInvitationRepository = residentInvitationRepository;
        this.apartmentRepository = apartmentRepository;
        this.emailService = emailService;
    }

    public ResidentInvitationResponse createResidentInvitation(ResidentInvitationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("A registered user already exists with email: " + request.getEmail());
        }

        String token = UUID.randomUUID().toString();
        ResidentInvitation invitation = ResidentInvitation.builder()
                .residentName(request.getResidentName())
                .email(request.getEmail())
                .token(token)
                .status(InvitationStatus.PENDING)
                .build();

        residentInvitationRepository.save(invitation);

        String link = frontendUrl + "/register/resident?token=" + token;

        try {
            String subject = "HydroFlow Water Management Platform - Resident Registration Invitation";
            String body = String.format(
                    "Hello %s,\n\nYou have been invited to register on the HydroFlow Water Management Platform.\n" +
                    "Please click the link below to set up your password and complete registration:\n\n%s\n\n" +
                    "If you did not request this invitation, please contact your Community Admin.",
                    invitation.getResidentName(), link
            );
            emailService.sendSimpleEmail(invitation.getEmail(), subject, body);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(AuthService.class).error("Error sending resident invitation email to {}", invitation.getEmail(), e);
        }

        return ResidentInvitationResponse.builder()
                .message("Resident registration invitation link created successfully.")
                .token(token)
                .invitationLink(link)
                .residentName(request.getResidentName())
                .email(request.getEmail())
                .status("PENDING")
                .build();
    }

    public ResidentInvitationResponse validateInvitation(String token) {

        ResidentInvitation invitation =
                residentInvitationRepository.findByToken(token)
                        .orElseThrow(() ->
                                new UserNotFoundException("Invitation not found."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidCredentialsException(
                    "Invitation is no longer valid.");
        }

        String link = frontendUrl + "/register/resident?token=" + token;

        return ResidentInvitationResponse.builder()
                .message("Invitation token is valid.")
                .token(token)
                .invitationLink(link)
                .residentName(invitation.getResidentName())
                .email(invitation.getEmail())
                .status(invitation.getStatus().name())
                .build();
    }

    public UserResponse completeResidentRegistration(
            ResidentRegistrationRequest request) {

        ResidentInvitation invitation =
                residentInvitationRepository.findByToken(request.getToken())
                        .orElseThrow(() ->
                                new UserNotFoundException("Invalid invitation token."));

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new InvalidCredentialsException(
                    "Invitation has already been used or expired.");
        }

        if (userRepository.existsByEmail(invitation.getEmail())) {
            throw new DuplicateEmailException(
                    "User already exists.");
        }

        User resident = User.builder()
                .name(invitation.getResidentName())
                .email(invitation.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.RESIDENT)
                .status(Status.APPROVED)
                .build();

        User savedUser = userRepository.save(resident);

        invitation.setStatus(InvitationStatus.ACCEPTED);

        residentInvitationRepository.save(invitation);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setStatus(savedUser.getStatus());

        return response;
    }

    public UserResponse createUser(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        // Only Community Admin can self-register
        if (request.getRole() == Role.SUPER_ADMIN) {
            throw new InvalidCredentialsException(
                    "SUPER_ADMIN cannot self-register."
            );
        }

        if (request.getRole() == Role.RESIDENT) {
            throw new InvalidCredentialsException(
                    "Residents cannot self-register. Contact your Community Admin."
            );
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.COMMUNITY_ADMIN)
                .status(Status.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setStatus(savedUser.getStatus());

        return response;
    }

    public UserResponse createSuperAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) throw new DuplicateEmailException("Email already exists");
        User user = userRepository.save(User.builder().name(request.getName()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())).role(Role.SUPER_ADMIN).status(Status.APPROVED).build());
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus());
    }

    public UserResponse completeCommunityAdminSetup(String email, CommunityAdminSetupRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Community Admin not found"));
        if (user.getRole() != Role.COMMUNITY_ADMIN || user.getStatus() != Status.APPROVED) {
            throw new InvalidCredentialsException("Only approved Community Admins can complete apartment setup.");
        }
        Apartment apartment;
        if (request.getApartmentId() != null) {
            apartment = apartmentRepository.findById(request.getApartmentId()).orElseThrow(() -> new UserNotFoundException("Apartment not found"));
        } else {
            if (request.getApartment() == null) throw new InvalidCredentialsException("Apartment details are required.");
            apartment = apartmentRepository.save(Apartment.builder().name(request.getApartment().getName()).address(request.getApartment().getAddress())
                    .city(request.getApartment().getCity()).state(request.getApartment().getState()).pincode(request.getApartment().getPincode())
                    .totalFlats(request.getApartment().getTotalFlats()).build());
        }
        user.setApartment(apartment);
        User saved = userRepository.save(user);
        UserResponse response = new UserResponse(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getStatus());
        response.setApartmentName(apartment.getName());
        response.setApartmentId(apartment.getId());
        response.setRequiresApartmentSetup(false);
        return response;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        if (user.getStatus() == Status.PENDING) {
            throw new AccountNotApprovedException(
                    "Account is pending approval"
            );
        }

        if (user.getStatus() == Status.REJECTED) {
            throw new AccountNotApprovedException(
                    "Account has been rejected"
            );
        }

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse(
                token,
                "Bearer",
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
        UserResponse userResponse = new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus());
        userResponse.setApartmentName(user.getApartment() != null ? user.getApartment().getName() : null);
        userResponse.setApartmentId(user.getApartment() != null ? user.getApartment().getId() : null);
        userResponse.setRequiresApartmentSetup(user.getRole() == Role.COMMUNITY_ADMIN && user.getApartment() == null);
        response.setUser(userResponse);
        return response;
    }

    public UserResponse approveCommunityAdmin(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (user.getRole() != Role.COMMUNITY_ADMIN) {
            throw new InvalidCredentialsException(
                    "Only Community Admin can be approved."
            );
        }

        user.setStatus(Status.APPROVED);

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setStatus(savedUser.getStatus());
        response.setApartmentName(savedUser.getApartment() != null ? savedUser.getApartment().getName() : "Green Valley Residency");

        return response;
    }

    public UserResponse assignApartmentToAdmin(Long adminId, Long apartmentId) {
        User user = userRepository.findById(adminId)
                .orElseThrow(() -> new UserNotFoundException("Community Admin not found: " + adminId));

        if (user.getRole() != Role.COMMUNITY_ADMIN) {
            throw new InvalidCredentialsException("Only Community Admins can be assigned to an apartment.");
        }

        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new RuntimeException("Apartment not found: " + apartmentId));

        // Enforce rule: 1 Community Admin manages at most 1 single apartment (replaces previous assignment)
        user.setApartment(apartment);
        User saved = userRepository.save(user);

        UserResponse response = new UserResponse();
        response.setId(saved.getId());
        response.setName(saved.getName());
        response.setEmail(saved.getEmail());
        response.setRole(saved.getRole());
        response.setStatus(saved.getStatus());
        response.setApartmentName(saved.getApartment().getName());
        return response;
    }

    public UserResponse rejectCommunityAdmin(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found"));

        if (user.getRole() != Role.COMMUNITY_ADMIN) {
            throw new InvalidCredentialsException(
                    "Only Community Admin can be rejected."
            );
        }

        user.setStatus(Status.REJECTED);

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setName(savedUser.getName());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setStatus(savedUser.getStatus());

        return response;
    }

    public List<UserResponse> getPendingCommunityAdmins() {

        List<User> users =
                userRepository.findByRoleAndStatus(
                        Role.COMMUNITY_ADMIN,
                        Status.PENDING
                );

        return users.stream().map(user -> {

            UserResponse response = new UserResponse();

            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setStatus(user.getStatus());
            response.setApartmentName(user.getApartment() != null ? user.getApartment().getName() : "Green Valley Residency");

            return response;

        }).toList();
    }

    public List<UserResponse> getAllCommunityAdmins() {
        List<User> users = userRepository.findByRole(Role.COMMUNITY_ADMIN);

        return users.stream().map(user -> {
            UserResponse response = new UserResponse();
            response.setId(user.getId());
            response.setName(user.getName());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setStatus(user.getStatus());
            response.setApartmentName(user.getApartment() != null ? user.getApartment().getName() : "Green Valley Residency");
            return response;
        }).toList();
    }
    public UserResponse createResident(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already exists");
        }

        User resident = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.RESIDENT)
                .status(Status.APPROVED)
                .build();

        User savedResident = userRepository.save(resident);

        UserResponse response = new UserResponse();

        response.setId(savedResident.getId());
        response.setName(savedResident.getName());
        response.setEmail(savedResident.getEmail());
        response.setRole(savedResident.getRole());
        response.setStatus(savedResident.getStatus());

        return response;
    }
    public ResidentInvitationResponse inviteResident(
            ResidentInvitationRequest request) {

        // Resident already has an account
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(
                    "A user with this email already exists."
            );
        }

        // Invitation already sent
        if (residentInvitationRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(
                    "An invitation has already been sent to this email."
            );
        }

        String token = UUID.randomUUID().toString();

        ResidentInvitation invitation = ResidentInvitation.builder()
                .residentName(request.getResidentName())
                .email(request.getEmail())
                .token(token)
                .status(InvitationStatus.PENDING)
                .build();

        residentInvitationRepository.save(invitation);

        String invitationLink =
                frontendUrl + "/register/resident?token=" + token;

        return new ResidentInvitationResponse(
                "Resident invitation created successfully.",
                token,
                invitationLink
        );
    }

    public com.infosys.water_management.dto.Response.UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new UserNotFoundException("User not found: " + email)));

        String apartmentName = user.getApartment() != null ? user.getApartment().getName() : "Green Valley Residency";
        String flatNumber = user.getHousehold() != null ? user.getHousehold().getFlatNumber() : "N/A";

        return com.infosys.water_management.dto.Response.UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .apartment(apartmentName)
                .household(flatNumber)
                .build();
    }

    public com.infosys.water_management.dto.Response.UserProfileResponse updateUserProfile(String currentEmail, com.infosys.water_management.dto.Response.UserProfileResponse request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new UserNotFoundException("User not found: " + currentEmail)));

        if (user.getRole() == Role.RESIDENT) {
            throw new InvalidCredentialsException("Resident profile details are read-only and managed by Community Admin.");
        }

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank() && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateEmailException("Email " + request.getEmail() + " is already in use.");
            }
            user.setEmail(request.getEmail());
        }

        User saved = userRepository.save(user);
        return getUserProfile(saved.getEmail());
    }

}