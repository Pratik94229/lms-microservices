package com.lms.user_service.repository;

import com.lms.user_service.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByKeycloakUserId(String keycloakUserId);

    Optional<User> findByUsername(String username);
}