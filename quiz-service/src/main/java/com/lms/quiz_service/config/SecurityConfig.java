package com.lms.quiz_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                // This is a stateless REST API,
                // so CSRF protection is not required.
                .csrf(csrf -> csrf.disable())

                // Configure which endpoints require authentication.
                .authorizeHttpRequests(auth -> auth

                        // These endpoints can be accessed
                        // without a JWT.
                        .requestMatchers(
                                "/actuator/health",
                                "/actuator/mappings"
                        ).permitAll()

                        // Every other endpoint requires
                        // a valid Keycloak JWT.
                        .anyRequest().authenticated()
                )

                // Configure JWT authentication.
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        keycloakJwtAuthenticationConverter()
                                )
                        )
                );

        return http.build();
    }


    /*
     * Converts Keycloak roles into Spring Security authorities.
     *
     * Keycloak JWT:
     *
     * "realm_access": {
     *     "roles": [
     *         "INSTRUCTOR",
     *         "STUDENT"
     *     ]
     * }
     *
     * Spring Security needs:
     *
     * ROLE_INSTRUCTOR
     * ROLE_STUDENT
     *
     * This allows us to use:
     *
     * @PreAuthorize("hasRole('INSTRUCTOR')")
     */
    @Bean
    public Converter<Jwt, AbstractAuthenticationToken>
    keycloakJwtAuthenticationConverter() {

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(
                jwt -> {

                    Collection<GrantedAuthority> authorities =
                            new ArrayList<>();

                    /*
                     * Get the realm_access object from
                     * the Keycloak JWT.
                     */
                    Map<String, Object> realmAccess =
                            jwt.getClaimAsMap("realm_access");

                    if (realmAccess != null) {

                        /*
                         * Get the roles array.
                         */
                        Object rolesObject =
                                realmAccess.get("roles");

                        if (rolesObject instanceof List<?> roles) {

                            /*
                             * Convert each Keycloak role:
                             *
                             * INSTRUCTOR
                             *
                             * into:
                             *
                             * ROLE_INSTRUCTOR
                             */
                            for (Object role : roles) {

                                authorities.add(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + role
                                        )
                                );
                            }
                        }
                    }

                    return authorities;
                }
        );

        return converter;
    }
}