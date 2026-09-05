package com.lms.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseAnalyticsResponse {

    private String courseId;

    private String courseTitle;

    private long totalStudents;

    private long completedStudents;

    private long inProgressStudents;

    private double completionPercentage;
}