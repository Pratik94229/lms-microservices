package com.lms.quiz_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionRequest {

    @NotBlank(message = "Option text is required")
    private String optionText;

    @NotNull(message = "Option order index is required")
    @Min(value = 1, message = "Option order index must be at least 1")
    private Integer orderIndex;

    @NotNull(message = "Correct flag is required")
    private Boolean correct;
}