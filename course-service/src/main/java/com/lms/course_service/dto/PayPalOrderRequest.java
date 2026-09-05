package com.lms.course_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayPalOrderRequest {

    @NotBlank(message = "Course ID is required")
    private String courseId;
}