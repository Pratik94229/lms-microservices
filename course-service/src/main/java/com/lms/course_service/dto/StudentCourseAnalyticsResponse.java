package com.lms.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCourseAnalyticsResponse {

    private String studentId;

    private String studentUsername;

    private String studentEmail;

    private String courseId;

    private LocalDateTime enrolledAt;

    private long completedLessons;

    private long totalLessons;

    private double progressPercentage;

    private boolean completed;

    private LocalDateTime completedAt;
}