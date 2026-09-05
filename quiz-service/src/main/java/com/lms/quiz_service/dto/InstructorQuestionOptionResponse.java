package com.lms.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorQuestionOptionResponse {

    private String id;

    private String optionText;

    private Integer orderIndex;

    private boolean correct;
}