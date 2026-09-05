package com.lms.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResultQuestionResponse {

    private String questionId;

    private String questionText;

    private Integer marks;

    private String selectedOptionId;

    private String selectedOptionText;

    private String correctOptionId;

    private String correctOptionText;

    private Boolean correct;
}