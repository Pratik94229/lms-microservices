package com.lms.course_service.config;

import com.lms.course_service.security.JwtPrincipal;
import feign.RequestInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class FeignClientConfig {

    @Bean
    public RequestInterceptor bearerTokenRequestInterceptor() {

        return requestTemplate -> {

            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            if (authentication != null
                    && authentication.getPrincipal() instanceof JwtPrincipal
                    && authentication.getCredentials() instanceof String token) {

                requestTemplate.header(
                        "Authorization",
                        "Bearer " + token
                );
            }
        };
    }
}