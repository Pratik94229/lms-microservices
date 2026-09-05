package com.lms.course_service.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class LessonUpdateRequest {

    @NotBlank(message = "Lesson title is required")
    @Size(
            max = 200,
            message = "Lesson title cannot exceed 200 characters"
    )
    private String title;

    @Size(
            max = 2000,
            message = "Lesson description cannot exceed 2000 characters"
    )
    private String description;

    @Size(
            max = 10000,
            message = "Lesson content cannot exceed 10000 characters"
    )
    private String content;

    private String videoUrl;

    @Min(
            value = 0,
            message = "Duration cannot be negative"
    )
    private Integer duration;

    @NotNull(message = "Order index is required")
    @Min(
            value = 1,
            message = "Order index must be at least 1"
    )
    private Integer orderIndex;
}