package com.lms.quiz_service.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignClientConfig {

    /*
     * Forward the JWT of the currently authenticated user
     * to the downstream microservice.
     */
    @Bean
    public RequestInterceptor requestInterceptor() {

        return requestTemplate -> {

            // Get the current authenticated user.
            Authentication authentication =
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication();

            /*
             * Make sure the authentication is based
             * on a JWT.
             */
            if (authentication instanceof JwtAuthenticationToken jwtAuth) {

                // Get the raw JWT value.
                String token =
                        jwtAuth.getToken().getTokenValue();

                // Add the JWT as a Bearer token.
                requestTemplate.header(
                        "Authorization",
                        "Bearer " + token
                );
            }
        };
    }
}
