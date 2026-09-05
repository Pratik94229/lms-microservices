package com.lms.course_service.config;

import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

public class FeignClientConfig {

    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {

        return requestTemplate -> {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (authentication instanceof JwtAuthenticationToken jwtAuthentication) {

                String token =
                        jwtAuthentication
                                .getToken()
                                .getTokenValue();

                requestTemplate.header(
                        "Authorization",
                        "Bearer " + token
                );
            }
        };
    }
}