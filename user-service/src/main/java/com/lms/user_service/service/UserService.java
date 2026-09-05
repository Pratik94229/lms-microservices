package com.lms.user_service.service;

import com.lms.user_service.model.User;
import com.lms.user_service.repository.UserRepository;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakAdminService keycloakAdminService;

    public UserService(
            UserRepository userRepository,
            KeycloakAdminService keycloakAdminService
    ) {
        this.userRepository = userRepository;
        this.keycloakAdminService = keycloakAdminService;
    }

    /*
     * =========================================================
     * GET OR CREATE CURRENT USER
     * =========================================================
     */

    public User getOrCreateUser(
            String keycloakUserId,
            String username,
            String email
    ) {

        return userRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseGet(() -> {

                    User user = new User();

                    user.setKeycloakUserId(keycloakUserId);
                    user.setUsername(username);
                    user.setEmail(email);

                    return userRepository.save(user);
                });
    }

    /*
     * =========================================================
     * UPDATE CURRENT USER PROFILE
     * =========================================================
     */

    public User updateUserProfile(
            String keycloakUserId,
            String firstName,
            String lastName,
            String phone
    ) {

        User user = userRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User profile not found"
                        )
                );

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);

        return userRepository.save(user);
    }

    /*
     * =========================================================
     * ADMIN - GET ALL USERS
     * =========================================================
     */

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    /*
     * =========================================================
     * ADMIN - DELETE USER
     * =========================================================
     *
     * Safety rules:
     *
     * 1. Admin cannot delete their own account.
     *
     * 2. The last remaining ADMIN cannot be deleted.
     *
     * 3. Keycloak account is deleted before MongoDB profile.
     */
    public void deleteUser(
            String keycloakUserId,
            String requestingAdminId
    ) {

        /*
         * Find the LMS profile that is going to be deleted.
         */
        User user = userRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User profile not found"
                        )
                );

        /*
         * =====================================================
         * SAFETY CHECK 1 - SELF DELETE
         * =====================================================
         */

        if (keycloakUserId.equals(requestingAdminId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete your own administrator account"
            );
        }

        /*
         * =====================================================
         * SAFETY CHECK 2 - LAST ADMIN
         * =====================================================
         *
         * We only need to perform this check when the
         * target user currently has the ADMIN role.
         */
        List<String> targetRoles =
                keycloakAdminService.getUserRealmRoles(
                        keycloakUserId
                );

        boolean targetIsAdmin =
                targetRoles.contains("ADMIN");

        if (targetIsAdmin) {

            List<User> allUsers =
                    userRepository.findAll();

            long adminCount = 0;

            for (User existingUser : allUsers) {

                List<String> roles =
                        keycloakAdminService.getUserRealmRoles(
                                existingUser.getKeycloakUserId()
                        );

                if (roles.contains("ADMIN")) {
                    adminCount++;
                }
            }

            /*
             * Never allow the last administrator to be deleted.
             */
            if (adminCount <= 1) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "The last administrator cannot be deleted"
                );
            }
        }

        /*
         * =====================================================
         * DELETE FROM KEYCLOAK
         * =====================================================
         */

        keycloakAdminService.deleteUser(
                keycloakUserId
        );

        /*
         * =====================================================
         * DELETE FROM MONGODB
         * =====================================================
         */

        userRepository.delete(user);
    }

    public User getUserByKeycloakUserId(String keycloakUserId) {

        return userRepository
                .findByKeycloakUserId(keycloakUserId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + keycloakUserId
                        )
                );
    }
    
    
}