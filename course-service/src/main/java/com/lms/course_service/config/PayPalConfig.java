package com.lms.course_service.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class PayPalConfig {

    @Value("${paypal.mode}")
    private String mode;

    @Value("${paypal.client-id}")
    private String clientId;

    @Value("${paypal.client-secret}")
    private String clientSecret;

    /*
     * Frontend URL used by PayPal after payment.
     *
     * Local development:
     * http://localhost:5173
     *
     * Production (Render):
     * Set FRONTEND_URL environment variable to:
     * https://lms-microservices-zeta.vercel.app
     *
     * The localhost URL is used as the default so local
     * development continues to work without extra configuration.
     */
    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    public String getMode() {
        return mode;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public String getBaseUrl() {

        if ("live".equalsIgnoreCase(mode)) {
            return "https://api-m.paypal.com";
        }

        return "https://api-m.sandbox.paypal.com";
    }
}