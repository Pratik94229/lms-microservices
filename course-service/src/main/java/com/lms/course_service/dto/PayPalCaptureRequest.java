package com.lms.course_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayPalCaptureRequest {

    @NotBlank(message = "PayPal order ID is required")
    private String orderId;
}