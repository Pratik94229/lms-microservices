package com.lms.course_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@CompoundIndex(
        name = "student_course_unique",
        def = "{'studentId': 1, 'courseId': 1}",
        unique = true
)
public class Enrollment {

    @Id
    private String id;

    /*
     * Keycloak user ID of the student.
     */
    private String studentId;

    /*
     * Course ID from the courses collection.
     */
    private String courseId;

    /*
     * When the student enrolled.
     */
    private LocalDateTime enrolledAt;

    /*
     * Whether the enrollment is currently active.
     *
     * A completed course remains active because the
     * student should still be able to access it.
     */
    private boolean active;

    /*
     * Whether the student has completed the entire course.
     */
    private boolean completed;

    /*
     * When the student completed the entire course.
     *
     * This remains null until completed becomes true.
     */
    private LocalDateTime completedAt;
}