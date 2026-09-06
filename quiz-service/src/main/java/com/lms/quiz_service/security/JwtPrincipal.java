package com.lms.quiz_service.security;

public record JwtPrincipal(
        String userId,
        String username,
        String email,
        String role
) {
}