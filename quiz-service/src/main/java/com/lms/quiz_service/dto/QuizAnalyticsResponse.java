package com.lms.quiz_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnalyticsResponse {

    private String quizId;

    private String quizTitle;

    private String sectionId;

    private long totalAttempts;

    private long passedAttempts;

    private long failedAttempts;

    private double passRate;

    private double averagePercentage;
}