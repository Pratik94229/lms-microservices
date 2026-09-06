package com.lms.quiz_service.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {

            Claims claims =
                    jwtService.extractClaims(token);

            String userId =
                    claims.getSubject();

            String username =
                    claims.get("username", String.class);

            String email =
                    claims.get("email", String.class);

            String role =
                    claims.get("role", String.class);

            if (userId != null &&
                    role != null &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null) {

                JwtPrincipal principal =
                        new JwtPrincipal(
                                userId,
                                username,
                                email,
                                role
                        );

                SimpleGrantedAuthority authority =
                        new SimpleGrantedAuthority(
                                "ROLE_" + role
                        );

                /*
                 * Store the original JWT as credentials.
                 *
                 * This allows Feign to forward the same
                 * Bearer token to Course Service.
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                principal,
                                token,
                                List.of(authority)
                        );

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception ignored) {

            // Invalid or expired JWT remains unauthenticated.
        }

        filterChain.doFilter(request, response);
    }
}