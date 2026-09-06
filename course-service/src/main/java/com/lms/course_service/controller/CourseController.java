package com.lms.course_service.controller;

import com.lms.course_service.dto.CourseAnalyticsResponse;
import com.lms.course_service.dto.CourseCreateRequest;
import com.lms.course_service.dto.CourseUpdateRequest;
import com.lms.course_service.dto.StudentCourseAnalyticsResponse;
import com.lms.course_service.model.Course;
import com.lms.course_service.security.JwtPrincipal;
import com.lms.course_service.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Course createCourse(
            @Valid @RequestBody CourseCreateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.createCourse(
                principal.userId(),
                principal.username(),
                request.getTitle(),
                request.getDescription(),
                request.getPrice()
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<Course> getMyCourses(
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.getCoursesByInstructor(
                principal.userId()
        );
    }

    @GetMapping
    public List<Course> getPublishedCourses() {
        return courseService.getPublishedCourses();
    }

    @PutMapping("/{courseId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Course publishCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.publishCourse(
                courseId,
                principal.userId()
        );
    }

    @GetMapping("/{courseId}")
    public Course getCourseById(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String requesterId = principal != null
                ? principal.userId()
                : null;

        return courseService.getCourseById(
                courseId,
                requesterId
        );
    }

    @GetMapping("/{courseId}/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public CourseAnalyticsResponse getCourseAnalytics(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.getCourseAnalytics(
                courseId,
                principal.userId()
        );
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Course updateCourse(
            @PathVariable String courseId,
            @Valid @RequestBody CourseUpdateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.updateCourse(
                courseId,
                principal.userId(),
                request.getTitle(),
                request.getDescription(),
                request.getPrice()
        );
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        courseService.deleteCourse(
                courseId,
                principal.userId()
        );

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{courseId}/analytics/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<StudentCourseAnalyticsResponse> getStudentCourseAnalytics(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        return courseService.getStudentCourseAnalytics(
                courseId,
                principal.userId()
        );
    }
}