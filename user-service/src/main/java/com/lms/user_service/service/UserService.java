package com.lms.user_service.service;

import com.lms.user_service.model.User;
import com.lms.user_service.repository.UserRepository;
import com.lms.user_service.security.JwtService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /*
     * =========================================================
     * REGISTER USER
     * =========================================================
     */

    public User registerUser(
            String username,
            String email,
            String password
    ) {

        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username already exists"
            );
        }

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email already exists"
            );
        }

        User user = new User();

        user.setUsername(username);
        user.setEmail(email);

        /*
         * NEVER store the plain password.
         */
        user.setPasswordHash(
                passwordEncoder.encode(password)
        );

        /*
         * Normal registration always creates
         * a STUDENT account.
         */
        user.setRole("STUDENT");

        return userRepository.save(user);
    }

    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */

    public String login(
            String username,
            String password
    ) {

        User user =
                userRepository.findByUsername(username)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "Invalid username or password"
                                )
                        );

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        user.getPasswordHash()
                );

        if (!passwordMatches) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid username or password"
            );
        }

        return jwtService.generateToken(user);
    }

    /*
     * =========================================================
     * GET USER BY USERNAME
     * =========================================================
     */

    public User getUserByUsername(String username) {

        return userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found"
                        )
                );
    }

    /*
     * =========================================================
     * GET CURRENT USER
     * =========================================================
     */

    public User getOrCreateUser(
            String userId,
            String username,
            String email
    ) {

        return userRepository
                .findById(userId)
                .orElseGet(() -> {

                    User user = new User();

                    user.setId(userId);
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setRole("STUDENT");

                    return userRepository.save(user);
                });
    }

    /*
     * =========================================================
     * UPDATE CURRENT USER PROFILE
     * =========================================================
     */

    public User updateUserProfile(
            String userId,
            String firstName,
            String lastName,
            String phone
    ) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
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
     * ADMIN - CHANGE USER ROLE
     * =========================================================
     */

    public User changeUserRole(
            String userId,
            String newRole
    ) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User not found"
                                )
                        );

        user.setRole(newRole);

        return userRepository.save(user);
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
     */

    public void deleteUser(
            String userId,
            String requestingAdminId
    ) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "User profile not found"
                                )
                        );

        /*
         * Safety check 1:
         * Admin cannot delete themselves.
         */
        if (userId.equals(requestingAdminId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot delete your own administrator account"
            );
        }

        /*
         * Safety check 2:
         * Never delete the last administrator.
         */
        if ("ADMIN".equals(user.getRole())) {

            long adminCount =
                    userRepository.findAll()
                            .stream()
                            .filter(existingUser ->
                                    "ADMIN".equals(
                                            existingUser.getRole()
                                    )
                            )
                            .count();

            if (adminCount <= 1) {

                throw new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "The last administrator cannot be deleted"
                );
            }
        }

        userRepository.delete(user);
    }

    /*
     * =========================================================
     * GET USER BY ID
     * =========================================================
     */

    public User getUserById(String userId) {

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "User not found: " + userId
                        )
                );
    }
}