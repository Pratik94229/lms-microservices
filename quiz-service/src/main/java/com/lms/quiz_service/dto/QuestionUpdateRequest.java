package com.lms.quiz_service.dto;


import com.lms.quiz_service.model.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionUpdateRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType type;

    @NotNull(message = "Order index is required")
    @Min(value = 1, message = "Order index must be at least 1")
    private Integer orderIndex;

    @NotNull(message = "Marks are required")
    @Min(value = 1, message = "Marks must be at least 1")
    private Integer marks;

    @NotEmpty(message = "At least one option is required")
    @Valid
    private List<QuestionOptionRequest> options;
}