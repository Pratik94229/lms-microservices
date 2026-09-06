package com.lms.quiz_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "quiz_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizAttempt {

    @Id
    private String id;

    /*
     * Quiz being attempted.
     */
    private String quizId;

    /*
     * Student who started the attempt.
     *
     * This is the subject (sub) from
     * the authenticated JWT.
     */
    private String studentId;

    /*
     * Attempt lifecycle.
     *
     * IN_PROGRESS
     * SUBMITTED
     */
    private AttemptStatus status;

    /*
     * Time when the attempt started.
     */
    private LocalDateTime startedAt;

    /*
     * Time when the attempt was submitted.
     */
    private LocalDateTime submittedAt;

    /*
     * Total marks obtained.
     */
    private Integer score;

    /*
     * Total marks available in the quiz.
     */
    private Integer totalMarks;

    /*
     * Percentage obtained.
     */
    private Double percentage;

    /*
     * Whether the student passed.
     */
    private Boolean passed;
}