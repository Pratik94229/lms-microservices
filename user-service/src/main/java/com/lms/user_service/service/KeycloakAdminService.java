package com.lms.user_service.service;

import com.lms.user_service.dto.RegisterRequest;
import com.lms.user_service.exception.RegistrationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class KeycloakAdminService {

    @Value("${keycloak.admin.server-url}")
    private String serverUrl;

    @Value("${keycloak.admin.realm}")
    private String realm;

    @Value("${keycloak.admin.client-id}")
    private String clientId;

    @Value("${keycloak.admin.client-secret}")
    private String clientSecret;

    /*
     * RestTemplate is used to communicate with
     * Keycloak's Admin REST API.
     */
    private final RestTemplate restTemplate = new RestTemplate();

    /*
     * ============================================================
     * CREATE USER IN KEYCLOAK
     * ============================================================
     */
    public String createUser(RegisterRequest request) {

        String adminToken = getAdminToken();

        Map<String, Object> user = new HashMap<>();

        user.put("username", request.getUsername());
        user.put("email", request.getEmail());
        user.put("enabled", true);
        user.put("emailVerified", true);

        Map<String, Object> credentials = new HashMap<>();

        credentials.put("type", "password");
        credentials.put("value", request.getPassword());
        credentials.put("temporary", false);

        user.put("credentials", new Object[]{credentials});

        String url = serverUrl
                + "/admin/realms/"
                + realm
                + "/users";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(adminToken);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(user, headers);

        try {

            ResponseEntity<Void> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.POST,
                            entity,
                            Void.class
                    );

            if (response.getStatusCode() == HttpStatus.CREATED) {

                String location =
                        response.getHeaders().getFirst("Location");

                if (location != null) {

                    return location.substring(
                            location.lastIndexOf("/") + 1
                    );
                }
            }

        } catch (HttpClientErrorException.Conflict ex) {

            throw new RegistrationException(
                    "Username or email already exists"
            );

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to create user in Keycloak",
                    ex
            );
        }

        throw new RegistrationException(
                "Failed to create user in Keycloak"
        );
    }

    /*
     * ============================================================
     * DELETE USER FROM KEYCLOAK
     * ============================================================
     *
     * Keycloak must be deleted successfully before the MongoDB
     * user profile is deleted.
     *
     * If Keycloak deletion fails, the exception is propagated
     * to UserService. MongoDB deletion will therefore NOT happen.
     */
    public void deleteUser(String keycloakUserId) {

        String adminToken = getAdminToken();

        String url = serverUrl
                + "/admin/realms/"
                + realm
                + "/users/"
                + keycloakUserId;

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(adminToken);

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        try {

            ResponseEntity<Void> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.DELETE,
                            entity,
                            Void.class
                    );

            /*
             * Keycloak normally returns 204 No Content
             * when the user is successfully deleted.
             */
            if (response.getStatusCode() != HttpStatus.NO_CONTENT) {

                throw new ResponseStatusException(
                        response.getStatusCode(),
                        "Failed to delete user from Keycloak"
                );
            }

        } catch (HttpClientErrorException ex) {

            /*
             * IMPORTANT:
             *
             * Do NOT just log the error.
             *
             * Propagate the Keycloak status so UserService
             * knows that Keycloak deletion failed.
             */
            throw convertKeycloakException(
                    "Failed to delete Keycloak user: "
                            + keycloakUserId,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * GET ADMIN ACCESS TOKEN
     * ============================================================
     *
     * The User Service authenticates as the
     * lms-user-service service account using:
     *
     * grant_type=client_credentials
     */
    private String getAdminToken() {

        String url = serverUrl
                + "/realms/"
                + realm
                + "/protocol/openid-connect/token";

        HttpHeaders headers = new HttpHeaders();

        headers.setContentType(
                MediaType.APPLICATION_FORM_URLENCODED
        );

        MultiValueMap<String, String> body =
                new LinkedMultiValueMap<>();

        body.add(
                "grant_type",
                "client_credentials"
        );

        body.add(
                "client_id",
                clientId
        );

        body.add(
                "client_secret",
                clientSecret
        );

        HttpEntity<MultiValueMap<String, String>> request =
                new HttpEntity<>(body, headers);

        try {

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            url,
                            request,
                            Map.class
                    );

            if (response.getBody() == null
                    || response.getBody().get("access_token") == null) {

                throw new RuntimeException(
                        "Failed to obtain Keycloak admin token"
                );
            }

            return response.getBody()
                    .get("access_token")
                    .toString();

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to obtain Keycloak admin token",
                    ex
            );
        }
    }

    /*
     * ============================================================
     * GET ALL KEYCLOAK USERS
     * ============================================================
     */
    public List<Map<String, Object>> getAllKeycloakUsers() {

        String adminToken = getAdminToken();

        String url = serverUrl
                + "/admin/realms/"
                + realm
                + "/users";

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(adminToken);

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        try {

            ResponseEntity<List> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            entity,
                            List.class
                    );

            if (response.getBody() == null) {
                return List.of();
            }

            return response.getBody();

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to fetch users from Keycloak",
                    ex
            );
        }
    }

    /*
     * ============================================================
     * GET USER REALM ROLES
     * ============================================================
     */
    public List<String> getUserRealmRoles(
            String keycloakUserId
    ) {

        String adminToken = getAdminToken();

        String url = serverUrl
                + "/admin/realms/"
                + realm
                + "/users/"
                + keycloakUserId
                + "/role-mappings/realm";

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(adminToken);

        HttpEntity<Void> entity =
                new HttpEntity<>(headers);

        try {

            ResponseEntity<List> response =
                    restTemplate.exchange(
                            url,
                            HttpMethod.GET,
                            entity,
                            List.class
                    );

            if (response.getBody() == null) {
                return List.of();
            }

            List<String> roles =
                    new ArrayList<>();

            for (Object roleObject : response.getBody()) {

                if (roleObject instanceof Map<?, ?> roleMap) {

                    Object roleName =
                            roleMap.get("name");

                    if (roleName != null) {

                        roles.add(
                                roleName.toString()
                        );
                    }
                }
            }

            return roles;

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to fetch Keycloak roles for user: "
                            + keycloakUserId,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * ASSIGN REALM ROLE
     * ============================================================
     */
    public void assignRealmRole(
            String keycloakUserId,
            String roleName
    ) {

        String adminToken = getAdminToken();

        /*
         * First retrieve the complete Keycloak role
         * representation.
         */
        String roleUrl = serverUrl
                + "/admin/realms/"
                + realm
                + "/roles/"
                + roleName;

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(adminToken);

        HttpEntity<Void> roleRequest =
                new HttpEntity<>(headers);

        try {

            ResponseEntity<Map> roleResponse =
                    restTemplate.exchange(
                            roleUrl,
                            HttpMethod.GET,
                            roleRequest,
                            Map.class
                    );

            if (roleResponse.getBody() == null) {

                throw new RuntimeException(
                        "Keycloak role not found: "
                                + roleName
                );
            }

            Map<String, Object> role =
                    roleResponse.getBody();

            /*
             * Endpoint used to assign a realm role
             * to a Keycloak user.
             */
            String mappingUrl = serverUrl
                    + "/admin/realms/"
                    + realm
                    + "/users/"
                    + keycloakUserId
                    + "/role-mappings/realm";

            headers.setContentType(
                    MediaType.APPLICATION_JSON
            );

            HttpEntity<List<Map<String, Object>>> mappingRequest =
                    new HttpEntity<>(
                            List.of(role),
                            headers
                    );

            restTemplate.exchange(
                    mappingUrl,
                    HttpMethod.POST,
                    mappingRequest,
                    Void.class
            );

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to assign role "
                            + roleName
                            + " to user: "
                            + keycloakUserId,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * REMOVE REALM ROLE
     * ============================================================
     */
    public void removeRealmRole(
            String keycloakUserId,
            String roleName
    ) {

        String adminToken = getAdminToken();

        /*
         * Retrieve the complete Keycloak role
         * representation first.
         */
        String roleUrl = serverUrl
                + "/admin/realms/"
                + realm
                + "/roles/"
                + roleName;

        HttpHeaders headers = new HttpHeaders();

        headers.setBearerAuth(adminToken);

        HttpEntity<Void> roleRequest =
                new HttpEntity<>(headers);

        try {

            ResponseEntity<Map> roleResponse =
                    restTemplate.exchange(
                            roleUrl,
                            HttpMethod.GET,
                            roleRequest,
                            Map.class
                    );

            if (roleResponse.getBody() == null) {

                throw new RuntimeException(
                        "Keycloak role not found: "
                                + roleName
                );
            }

            Map<String, Object> role =
                    roleResponse.getBody();

            String mappingUrl = serverUrl
                    + "/admin/realms/"
                    + realm
                    + "/users/"
                    + keycloakUserId
                    + "/role-mappings/realm";

            headers.setContentType(
                    MediaType.APPLICATION_JSON
            );

            HttpEntity<List<Map<String, Object>>> mappingRequest =
                    new HttpEntity<>(
                            List.of(role),
                            headers
                    );

            restTemplate.exchange(
                    mappingUrl,
                    HttpMethod.DELETE,
                    mappingRequest,
                    Void.class
            );

        } catch (HttpClientErrorException ex) {

            throw convertKeycloakException(
                    "Failed to remove role "
                            + roleName
                            + " from user: "
                            + keycloakUserId,
                    ex
            );
        }
    }

    /*
     * ============================================================
     * CHANGE USER ROLE
     * ============================================================
     */
    public void changeUserRole(
            String keycloakUserId,
            String newRole
    ) {

        List<String> allowedRoles =
                List.of(
                        "STUDENT",
                        "INSTRUCTOR",
                        "ADMIN"
                );

        if (!allowedRoles.contains(newRole)) {

            throw new IllegalArgumentException(
                    "Invalid LMS role: "
                            + newRole
            );
        }

        /*
         * Get all current realm roles.
         */
        List<String> currentRoles =
                getUserRealmRoles(
                        keycloakUserId
                );

        /*
         * Remove only LMS roles.
         *
         * We deliberately ignore:
         *
         * default-roles-lms
         * offline_access
         * uma_authorization
         * realm-management roles
         */
        for (String role : currentRoles) {

            if (allowedRoles.contains(role)) {

                removeRealmRole(
                        keycloakUserId,
                        role
                );
            }
        }

        /*
         * Assign the new LMS role.
         */
        assignRealmRole(
                keycloakUserId,
                newRole
        );
    }

    /*
     * ============================================================
     * KEYCLOAK ERROR HANDLING
     * ============================================================
     *
     * Previously, Keycloak errors such as:
     *
     * 403 Forbidden
     *
     * were wrapped inside RuntimeException and eventually
     * appeared to the frontend as:
     *
     * 500 Internal Server Error
     *
     * This method preserves the HTTP status returned by
     * Keycloak so the REST API can respond appropriately.
     */
    private ResponseStatusException convertKeycloakException(
            String message,
            HttpClientErrorException ex
    ) {

        System.err.println(
                message
        );

        System.err.println(
                "Keycloak status: "
                        + ex.getStatusCode()
        );

        System.err.println(
                "Keycloak response: "
                        + ex.getResponseBodyAsString()
        );

        return new ResponseStatusException(
                ex.getStatusCode(),
                message,
                ex
        );
    }
}