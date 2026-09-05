package com.lms.user_service.controller;

import com.lms.user_service.dto.RegisterRequest;
import com.lms.user_service.model.User;
import com.lms.user_service.service.KeycloakAdminService;
import com.lms.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final KeycloakAdminService keycloakAdminService;
    private final UserService userService;

    public AuthController(
            KeycloakAdminService keycloakAdminService,
            UserService userService
    ) {
        this.keycloakAdminService = keycloakAdminService;
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        /*
         * Step 1:
         * Create the user in Keycloak first.
         */
        String keycloakUserId =
                keycloakAdminService.createUser(request);

        try {

            /*
             * Step 2:
             * Every user registered through the normal
             * registration endpoint is a STUDENT.
             *
             * The ADMIN can later change the user's role
             * through the Admin Dashboard.
             */
            keycloakAdminService.assignRealmRole(
                    keycloakUserId,
                    "STUDENT"
            );

            /*
             * Step 3:
             * Create the corresponding user profile
             * in MongoDB.
             */
            User user = userService.getOrCreateUser(
                    keycloakUserId,
                    request.getUsername(),
                    request.getEmail()
            );

            /*
             * Step 4:
             * Registration succeeded in:
             *
             * Keycloak
             * + STUDENT role
             * + MongoDB
             */
            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message",
                            "User registered successfully",

                            "userId",
                            user.getId(),

                            "keycloakUserId",
                            keycloakUserId,

                            "role",
                            "STUDENT"
                    ));

        } catch (Exception ex) {

            /*
             * Step 5:
             *
             * Something failed after the Keycloak user
             * was created.
             *
             * Delete the Keycloak user so we don't leave
             * an incomplete account behind.
             */
            keycloakAdminService.deleteUser(
                    keycloakUserId
            );

            /*
             * Re-throw the original exception.
             */
            throw ex;
        }
    }
}