package com.lms.course_service.controller;

import com.lms.course_service.dto.CourseAnalyticsResponse;
import com.lms.course_service.dto.CourseCreateRequest;
import com.lms.course_service.dto.CourseUpdateRequest;
import com.lms.course_service.dto.StudentCourseAnalyticsResponse;
import com.lms.course_service.model.Course;
import com.lms.course_service.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
            @AuthenticationPrincipal Jwt jwt
    ) {

        String instructorId = jwt.getSubject();

        String instructorUsername =
                jwt.getClaimAsString("preferred_username");

        return courseService.createCourse(
                instructorId,
                instructorUsername,
                request.getTitle(),
                request.getDescription(),
                request.getPrice()
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<Course> getMyCourses(
            @AuthenticationPrincipal Jwt jwt
    ) {

        String instructorId = jwt.getSubject();

        return courseService.getCoursesByInstructor(instructorId);
    }

    @GetMapping
    public List<Course> getPublishedCourses() {

        return courseService.getPublishedCourses();
    }

    @PutMapping("/{courseId}/publish")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Course publishCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String instructorId = jwt.getSubject();

        return courseService.publishCourse(
                courseId,
                instructorId
        );
    }

    @GetMapping("/{courseId}")
    public Course getCourseById(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // JWT is null when an anonymous user requests
        // a public course.
        String requesterId = jwt != null
                ? jwt.getSubject()
                : null;

        return courseService.getCourseById(
                courseId,
                requesterId
        );
    }

    /*
     * =========================================================
     * COURSE ANALYTICS
     * =========================================================
     *
     * Returns enrollment and completion statistics
     * for the authenticated instructor's course.
     */
    @GetMapping("/{courseId}/analytics")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public CourseAnalyticsResponse getCourseAnalytics(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get the authenticated instructor's
        // Keycloak user ID from the JWT.
        String instructorId = jwt.getSubject();

        return courseService.getCourseAnalytics(
                courseId,
                instructorId
        );
    }

    @PutMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Course updateCourse(
            @PathVariable String courseId,
            @Valid @RequestBody CourseUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get the authenticated instructor's
        // Keycloak user ID from the JWT.
        String instructorId = jwt.getSubject();

        // Pass the authenticated user's ID to the service.
        return courseService.updateCourse(
                courseId,
                instructorId,
                request.getTitle(),
                request.getDescription(),
                request.getPrice()
        );
    }

    @DeleteMapping("/{courseId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get the authenticated instructor's Keycloak ID.
        String instructorId = jwt.getSubject();

        // Delete the course after verifying ownership.
        courseService.deleteCourse(
                courseId,
                instructorId
        );

        // 204 means:
        // Request succeeded, but there is no response body.
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{courseId}/analytics/students")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<StudentCourseAnalyticsResponse> getStudentCourseAnalytics(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String instructorId = jwt.getSubject();

        return courseService.getStudentCourseAnalytics(
                courseId,
                instructorId
        );
    }
}