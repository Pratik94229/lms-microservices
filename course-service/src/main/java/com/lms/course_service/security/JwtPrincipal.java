package com.lms.course_service.security;

public record JwtPrincipal(
        String userId,
        String username,
        String email,
        String role
) {
}