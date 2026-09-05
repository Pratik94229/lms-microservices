package com.lms.quiz_service.dto;

import com.lms.quiz_service.model.AttemptStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptResponse {

    private String id;

    private String quizId;

    private AttemptStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer score;

    private Integer totalMarks;

    private Double percentage;

    private Boolean passed;
}