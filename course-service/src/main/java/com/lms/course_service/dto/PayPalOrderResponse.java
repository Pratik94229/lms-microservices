package com.lms.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayPalOrderResponse {

    private String orderId;

    private String status;

    private String approvalUrl;
}