package com.lms.course_service.controller;

import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.model.Enrollment;
import com.lms.course_service.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public Enrollment enrollInCourse(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt.getSubject();

        return enrollmentService.enrollStudent(
                courseId,
                studentId
        );
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Enrollment> getMyEnrollments(
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt.getSubject();

        return enrollmentService.getMyEnrollments(
                studentId
        );
    }

    /*
     * =========================================================
     * VERIFY STUDENT ENROLLMENT
     * =========================================================
     *
     * Quiz Service will call this endpoint before allowing
     * a student to start a quiz.
     *
     * 200 OK  -> student is enrolled
     * 403     -> student is not enrolled
     */
    @GetMapping("/courses/{courseId}/access")
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.OK)
    public void verifyStudentEnrollment(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {
        String studentId = jwt.getSubject();

        boolean enrolled =
                enrollmentService.isStudentEnrolled(
                        courseId,
                        studentId
                );

        if (!enrolled) {
            throw new CourseEnrollmentAccessDeniedException(
                    "You are not enrolled in this course"
            );
        }
    }
}