package com.lms.course_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "lesson_progress")
@CompoundIndex(
        name = "student_lesson_unique",
        def = "{'studentId': 1, 'lessonId': 1}",
        unique = true
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonProgress {

    @Id
    private String id;

    private String studentId;

    private String lessonId;

    private String courseId;

    private boolean completed;

    private LocalDateTime completedAt;
}