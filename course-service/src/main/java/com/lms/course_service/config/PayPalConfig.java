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

    public String getMode() {
        return mode;
    }

    public String getClientId() {
        return clientId;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public String getBaseUrl() {

        if ("live".equalsIgnoreCase(mode)) {
            return "https://api-m.paypal.com";
        }

        return "https://api-m.sandbox.paypal.com";
    }
}