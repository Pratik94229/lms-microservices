package com.lms.course_service.controller;

import com.lms.course_service.service.PayPalService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/paypal")
public class PayPalTestController {

    private final PayPalService payPalService;

    @GetMapping("/test")
    public Map<String, String> testPayPalConnection() {

        String accessToken = payPalService.getAccessToken();

        return Map.of(
                "message", "PayPal connection successful",
                "tokenReceived", String.valueOf(
                        accessToken != null && !accessToken.isBlank()
                )
        );
    }
}