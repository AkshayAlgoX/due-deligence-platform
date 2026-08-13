// src/test/java/com/realestate/duediligence/service/impl/PropertyServiceImplTest.java
package com.realestate.duediligence.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.realestate.duediligence.dto.PropertyRequest;
import com.realestate.duediligence.dto.PropertyResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.Role;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.RoleType;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.integration.AddressValidationService;
import com.realestate.duediligence.service.AuditLogService;
import com.realestate.duediligence.service.GeocodingService;
import com.realestate.duediligence.service.PortfolioSnapshotService;
import com.realestate.duediligence.service.PropertyVerificationService;

/**
 * Unit tests for PropertyServiceImpl.
 * Covers CRUD, address validation, user-scoped listing and search.
 */
@ExtendWith(MockitoExtension.class)
class PropertyServiceImplTest {

    @Mock private AddressValidationService addressValidationService;
    @Mock private PropertyRepository propertyRepository;
    @Mock private PropertyVerificationService verificationService;
    @Mock private UserRepository userRepository;
    @Mock private PortfolioSnapshotService portfolioSnapshotService;
    @Mock private AuditLogService auditLogService;
    @Mock private GeocodingService geocodingService;

    @InjectMocks
    private PropertyServiceImpl service;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(5L);
        user.setEmail("buyer@test.com");
        Role role = new Role();
        role.setRoleName(RoleType.BUYER);
        user.setRole(role);

        // Used by mapToResponse in most tests — lenient so non-mapping tests stay clean
        lenient().when(verificationService.findMissingFields(any(Property.class)))
                .thenReturn(List.of());
        lenient().when(verificationService.getTotalChecks()).thenReturn(6);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAsBuyer() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(
                        "buyer@test.com", null, List.of()));
    }

    private PropertyRequest request(String address, String city) {
        PropertyRequest request = new PropertyRequest();
        request.setAddress(address);
        request.setCity(city);
        return request;
    }

    private Property ownedProperty(long id) {
        Property property = new Property();
        property.setId(id);
        property.setAddress("42 MG Road");
        property.setCreatedBy(user);
        return property;
    }

    // ── addProperty ─────────────────────────────────────────────────

    @Test
    void should_addProperty_andReturnResponse() {
        // Given — valid address, authenticated buyer
        authenticateAsBuyer();
        when(addressValidationService.validateAddress("42 MG Road")).thenReturn(true);
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> {
            inv.<Property>getArgument(0).setId(1L);
            return inv.getArgument(0);
        });

        // When
        PropertyResponse response = service.addProperty(request("42 MG Road", "Bengaluru"));

        // Then — saved + downstream side effects fired
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getAddress()).isEqualTo("42 MG Road");
        verify(portfolioSnapshotService).refreshSnapshotForUser(5L);
        verify(geocodingService).geocodePropertyAsync(1L);
    }

    @Test
    void should_throw_whenAddressInvalid() {
        // Given — validator rejects the address
        when(addressValidationService.validateAddress("bad")).thenReturn(false);

        // When / Then
        assertThatThrownBy(() -> service.addProperty(request("bad", "City")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid property address");
    }

    // ── updateProperty ──────────────────────────────────────────────

    @Test
    void should_updateProperty_whenOwner() {
        // Given — owner updates their own property
        authenticateAsBuyer();
        Property existing = ownedProperty(1L);
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(propertyRepository.save(any(Property.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        PropertyResponse response =
                service.updateProperty(1L, request("New Address", "Bengaluru"));

        // Then
        assertThat(response.getAddress()).isEqualTo("New Address");
    }

    @Test
    void should_throw_whenUpdatingMissingProperty() {
        // Given — no property with that id (lookup happens before auth resolution)
        authenticateAsBuyer();
        when(propertyRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() ->
                service.updateProperty(99L, request("Some Address", "City")))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Property not found");
    }

    // ── getPropertyById ─────────────────────────────────────────────

    @Test
    void should_getPropertyById_whenOwner() {
        // Given
        authenticateAsBuyer();
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(ownedProperty(1L)));

        // When
        PropertyResponse response = service.getPropertyById(1L);

        // Then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getAddress()).isEqualTo("42 MG Road");
    }

    // ── getAllProperties ────────────────────────────────────────────

    @Test
    void should_listOnlyOwnedProperties_forBuyer() {
        // Given — non-admin buyer with one property
        authenticateAsBuyer();
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.findByCreatedById(5L)).thenReturn(List.of(ownedProperty(1L)));

        // When
        List<PropertyResponse> result = service.getAllProperties();

        // Then — user-scoped repository used
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAddress()).isEqualTo("42 MG Road");
        verify(propertyRepository).findByCreatedById(5L);
    }

    // ── searchProperties ────────────────────────────────────────────

    @Test
    void should_searchProperties_byKeywordForOwner() {
        // Given — query matches one property of the buyer
        authenticateAsBuyer();
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.searchByKeywordAndUser("villa", 5L))
                .thenReturn(List.of(ownedProperty(1L)));

        // When
        List<PropertyResponse> result = service.searchProperties("Villa");

        // Then — case-insensitive user-scoped search
        assertThat(result).hasSize(1);
        verify(propertyRepository).searchByKeywordAndUser("villa", 5L);
    }

    // ── deleteProperty ──────────────────────────────────────────────

    @Test
    void should_deleteProperty_whenOwner() {
        // Given
        authenticateAsBuyer();
        Property existing = ownedProperty(1L);
        when(userRepository.findByEmail("buyer@test.com")).thenReturn(Optional.of(user));
        when(propertyRepository.findById(1L)).thenReturn(Optional.of(existing));

        // When
        service.deleteProperty(1L);

        // Then — deleted and portfolio refreshed
        verify(propertyRepository).delete(existing);
        verify(portfolioSnapshotService).refreshSnapshotForUser(5L);
    }
}
