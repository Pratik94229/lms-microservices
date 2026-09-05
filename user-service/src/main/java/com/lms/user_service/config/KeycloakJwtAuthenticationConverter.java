package com.lms.user_service.config;

import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.core.convert.converter.Converter;
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

        if (realmAccess == null) {
            return new JwtAuthenticationToken(jwt);
        }

        @SuppressWarnings("unchecked")
        List<String> roles =
                (List<String>) realmAccess.get("roles");

        if (roles == null) {
            return new JwtAuthenticationToken(jwt);
        }

        Collection<SimpleGrantedAuthority> authorities =
                roles.stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList());

        return new JwtAuthenticationToken(jwt, authorities);
    }
}
