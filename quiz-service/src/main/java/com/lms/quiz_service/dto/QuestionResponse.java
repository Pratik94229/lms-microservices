package com.lms.quiz_service.dto;

import com.lms.quiz_service.model.QuestionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private String id;

    private String questionText;

    private QuestionType type;

    private Integer orderIndex;

    private Integer marks;

    private List<QuestionOptionResponse> options;
}