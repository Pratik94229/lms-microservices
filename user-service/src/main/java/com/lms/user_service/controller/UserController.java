package com.lms.user_service.controller;

import com.lms.user_service.dto.AdminUserResponse;
import com.lms.user_service.dto.ChangeUserRoleRequest;
import com.lms.user_service.dto.UserProfileUpdateRequest;
import com.lms.user_service.model.User;
import com.lms.user_service.service.UserService;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /*
     * =========================================================
     * ROLE TEST ENDPOINTS
     * =========================================================
     */

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
     *
     * JWT subject = MongoDB User ID
     */

    @GetMapping("/me")
    public User getCurrentUser(
            @AuthenticationPrincipal User currentUser
    ) {
        return userService.getUserById(currentUser.getId());
    }

    /*
     * =========================================================
     * UPDATE CURRENT USER
     * =========================================================
     */

    @PutMapping("/me")
    public User updateCurrentUser(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UserProfileUpdateRequest request
    ) {

        return userService.updateUserProfile(
                currentUser.getId(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone()
        );
    }

    /*
     * =========================================================
     * ADMIN - GET ALL USERS
     * =========================================================
     */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<AdminUserResponse> getAllUsers() {

        List<User> users = userService.getAllUsers();

        return users.stream()
                .map(user -> new AdminUserResponse(
                        user,
                        List.of(user.getRole())
                ))
                .toList();
    }

    /*
     * =========================================================
     * ADMIN - CHANGE USER ROLE
     * =========================================================
     */

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> changeUserRole(
            @PathVariable String userId,
            @Valid @RequestBody ChangeUserRoleRequest request
    ) {

        User updatedUser = userService.changeUserRole(
                userId,
                request.getRole()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(Map.of(
                        "message", "User role updated successfully",
                        "userId", updatedUser.getId(),
                        "role", updatedUser.getRole()
                ));
    }

    /*
     * =========================================================
     * ADMIN - DELETE USER
     * =========================================================
     */

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable String userId,
            @AuthenticationPrincipal User currentAdmin
    ) {

        userService.deleteUser(
                userId,
                currentAdmin.getId()
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(Map.of(
                        "message", "User deleted successfully",
                        "userId", userId
                ));
    }

    /*
     * =========================================================
     * GET USER BY ID
     * =========================================================
     *
     * Used by other LMS services.
     */

    @GetMapping("/{userId}")
    public User getUserById(
            @PathVariable String userId
    ) {
        return userService.getUserById(userId);
    }
}