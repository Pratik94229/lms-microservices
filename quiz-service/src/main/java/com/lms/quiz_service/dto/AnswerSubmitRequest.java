package com.lms.quiz_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnswerSubmitRequest {

    @NotBlank(message = "Question ID is required")
    private String questionId;

    @NotBlank(message = "Selected option ID is required")
    private String selectedOptionId;
}