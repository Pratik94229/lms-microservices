package com.lms.user_service.controller;

import com.lms.user_service.dto.RegisterRequest;
import com.lms.user_service.model.User;
import com.lms.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /*
     * =========================================================
     * REGISTER
     * =========================================================
     *
     * POST /api/auth/register
     *
     * Normal registration creates a STUDENT account.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        User user = userService.registerUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "User registered successfully",
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                ));
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     *
     * POST /api/auth/login
     *
     * Returns a JWT when username/password are valid.
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        String token = userService.login(
                request.getUsername(),
                request.getPassword()
        );

        User user =
                userService.getUserByUsername(
                        request.getUsername()
                );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "token", token,
                        "userId", user.getId(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        );
    }

    /*
     * =========================================================
     * LOGIN REQUEST DTO
     * =========================================================
     */
    public static class LoginRequest {

        private String username;
        private String password;

        public LoginRequest() {
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}