package com.lms.course_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // REST API does not use browser sessions.
                .csrf(csrf -> csrf.disable())

                // JWT authentication is stateless.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Anyone can browse published courses.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/courses"
                        ).permitAll()

                        // Anyone can view a course by ID.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/courses/*"
                        ).permitAll()

                        // Anyone can view sections of a course.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/courses/*/sections"
                        ).permitAll()

                        // Anyone can view lessons in a section.
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/sections/*/lessons"
                        ).permitAll()

                        // Everything else requires authentication.
                        .anyRequest().authenticated()
                )

                // Validate JWT using Keycloak.
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        new KeycloakJwtAuthenticationConverter()
                                )
                        )
                );

        return http.build();
    }
}