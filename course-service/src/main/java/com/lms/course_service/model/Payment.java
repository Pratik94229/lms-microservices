package com.lms.course_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;

    private String studentId;

    private String courseId;

    private String paypalOrderId;

    private String paypalCaptureId;

    private Double amount;

    private String currency;

    private PaymentStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;
}