package com.lms.user_service.controller;

import com.lms.user_service.dto.AdminUserResponse;
import com.lms.user_service.dto.ChangeUserRoleRequest;
import com.lms.user_service.dto.UserProfileUpdateRequest;
import com.lms.user_service.model.User;
import com.lms.user_service.service.KeycloakAdminService;
import com.lms.user_service.service.UserService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final KeycloakAdminService keycloakAdminService;

    public UserController(
            UserService userService,
            KeycloakAdminService keycloakAdminService
    ) {
        this.userService = userService;
        this.keycloakAdminService = keycloakAdminService;
    }

//    @GetMapping("/test")
//    public String test() {
//        return "User Service is Working";
//    }

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public String student() {
        return "Hello Student! You have STUDENT role.";
    }

    @GetMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public String instructorOnly() {
        return "Hello Instructor! You have INSTRUCTOR role.";
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminOnly() {
        return "Hello Admin! You have ADMIN role.";
    }

    /*
     * =========================================================
     * CURRENT USER
     * =========================================================
     */

    @GetMapping("/me")
    public User getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String keycloakUserId =
                jwt.getSubject();

        String username =
                jwt.getClaimAsString(
                        "preferred_username"
                );

        String email =
                jwt.getClaimAsString(
                        "email"
                );

        return userService.getOrCreateUser(
                keycloakUserId,
                username,
                email
        );
    }

    /*
     * =========================================================
     * UPDATE CURRENT USER
     * =========================================================
     */

    @PutMapping("/me")
    public User updateCurrentUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {

        String keycloakUserId =
                jwt.getSubject();

        return userService.updateUserProfile(
                keycloakUserId,
                request.getFirstName(),
                request.getLastName(),
                request.getPhone()
        );
    }

    /*
     * =========================================================
     * ADMIN - GET ALL USERS WITH KEYCLOAK ROLES
     * =========================================================
     */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserResponse> getAllUsers() {

        List<User> users =
                userService.getAllUsers();

        return users.stream()
                .map(user -> {

                    List<String> roles =
                            keycloakAdminService
                                    .getUserRealmRoles(
                                            user.getKeycloakUserId()
                                    );

                    return new AdminUserResponse(
                            user,
                            roles
                    );
                })
                .toList();
    }

    /*
     * =========================================================
     * ADMIN - CHANGE USER ROLE
     * =========================================================
     */

    @PutMapping("/{keycloakUserId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @PathVariable String keycloakUserId,
            @Valid @RequestBody ChangeUserRoleRequest request
    ) {

        keycloakAdminService.changeUserRole(
                keycloakUserId,
                request.getRole()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(Map.of(
                        "message",
                        "User role updated successfully",

                        "keycloakUserId",
                        keycloakUserId,

                        "role",
                        request.getRole()
                ));
    }

    /*
     * =========================================================
     * ADMIN - DELETE USER
     * =========================================================
     *
     * DELETE /api/users/{keycloakUserId}
     *
     * Only an ADMIN can delete a user.
     */
    @DeleteMapping("/{keycloakUserId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable String keycloakUserId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        /*
         * The subject of the JWT is the Keycloak user ID
         * of the administrator making this request.
         */
        String requestingAdminId =
                jwt.getSubject();

        userService.deleteUser(
                keycloakUserId,
                requestingAdminId
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(Map.of(
                        "message",
                        "User deleted successfully",

                        "keycloakUserId",
                        keycloakUserId
                ));
    }
    
    @GetMapping("/{keycloakUserId}")
    public User getUserByKeycloakUserId(
            @PathVariable String keycloakUserId
    ) {
        return userService
                .getUserByKeycloakUserId(keycloakUserId);
    }
    
    
    
}