package com.lms.quiz_service.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptAnswerResponse {

    private String questionId;

    private String selectedOptionId;
}