package com.lms.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InstructorQuestionResponse {

    private String id;

    private String questionText;

    private com.lms.quiz_service.model.QuestionType type;

    private Integer orderIndex;

    private Integer marks;

    private List<InstructorQuestionOptionResponse> options;
}