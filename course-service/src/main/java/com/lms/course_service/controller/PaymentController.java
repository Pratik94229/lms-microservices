package com.lms.course_service.controller;

import com.lms.course_service.dto.PayPalCaptureRequest;
import com.lms.course_service.dto.PayPalOrderRequest;
import com.lms.course_service.dto.PayPalOrderResponse;
import com.lms.course_service.model.Payment;
import com.lms.course_service.security.JwtPrincipal;
import com.lms.course_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @PreAuthorize("hasRole('STUDENT')")
    public PayPalOrderResponse createPaymentOrder(
            @Valid @RequestBody PayPalOrderRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return paymentService.createPayPalOrder(
                request.getCourseId(),
                studentId
        );
    }

    @PostMapping("/capture")
    @PreAuthorize("hasRole('STUDENT')")
    public Payment capturePayment(
            @Valid @RequestBody PayPalCaptureRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return paymentService.capturePayPalOrder(
                request.getOrderId(),
                studentId
        );
    }
}