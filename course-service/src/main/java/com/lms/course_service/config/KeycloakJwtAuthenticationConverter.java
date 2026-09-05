package com.lms.course_service.config;


import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class KeycloakJwtAuthenticationConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        Map<String, Object> realmAccess =
                jwt.getClaim("realm_access");

        Collection<SimpleGrantedAuthority> authorities =
                List.of();

        if (realmAccess != null) {

            Object rolesObject =
                    realmAccess.get("roles");

            if (rolesObject instanceof List<?> roles) {

                authorities = roles.stream()
                        .filter(role -> role instanceof String)
                        .map(role ->
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                        )
                        .collect(Collectors.toList());
            }
        }

        return new JwtAuthenticationToken(
                jwt,
                authorities
        );
    }
}
