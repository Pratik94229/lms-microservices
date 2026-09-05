package com.lms.quiz_service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class QuizUpdateRequest {

    @NotBlank(message = "Quiz title is required")
    @Size(
            max = 200,
            message = "Quiz title cannot exceed 200 characters"
    )
    private String title;

    @Size(
            max = 2000,
            message = "Quiz description cannot exceed 2000 characters"
    )
    private String description;

    @NotNull(message = "Passing score is required")
    @Min(
            value = 0,
            message = "Passing score cannot be less than 0"
    )
    @Max(
            value = 100,
            message = "Passing score cannot exceed 100"
    )
    private Integer passingScore;

    @Min(
            value = 1,
            message = "Time limit must be at least 1 minute"
    )
    private Integer timeLimit;
}