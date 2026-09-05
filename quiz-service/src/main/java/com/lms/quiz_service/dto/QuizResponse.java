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
public class QuizResponse {

    private String id;

    private String sectionId;

    private String title;

    private String description;

    private Integer passingScore;

    private Integer timeLimit;

    private List<QuestionResponse> questions;
}