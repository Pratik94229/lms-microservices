package com.lms.course_service.service;

import com.lms.course_service.exception.AlreadyEnrolledException;
import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.exception.CourseNotFoundException;
import com.lms.course_service.model.Course;
import com.lms.course_service.model.Enrollment;
import com.lms.course_service.repository.CourseRepository;
import com.lms.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;


    /*
     * =========================================================
     * ENROLL STUDENT IN COURSE
     * =========================================================
     */
    public Enrollment enrollStudent(
            String courseId,
            String studentId
    ) {

        // ---------------------------------------------------------
        // 1. Make sure the course exists.
        // ---------------------------------------------------------
        Course course =
                courseRepository
                        .findById(courseId)
                        .orElseThrow(() ->
                                new CourseNotFoundException(
                                        "Course not found"
                                )
                        );


        // ---------------------------------------------------------
        // 2. Only published courses can be enrolled in.
        // ---------------------------------------------------------
        if (!course.isPublished()) {

            throw new CourseEnrollmentAccessDeniedException(
                    "You cannot enroll in an unpublished course"
            );
        }


        // ---------------------------------------------------------
        // 3. Check whether the student is already enrolled.
        // ---------------------------------------------------------
        if (enrollmentRepository
                .existsByStudentIdAndCourseId(
                        studentId,
                        courseId
                )) {

            throw new AlreadyEnrolledException(
                    "You are already enrolled in this course"
            );
        }


        // ---------------------------------------------------------
        // 4. Create enrollment.
        // ---------------------------------------------------------
        Enrollment enrollment =
                Enrollment.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .enrolledAt(LocalDateTime.now())
                        .active(true)
                        .completed(false)
                        .completedAt(null)
                        .build();


        // ---------------------------------------------------------
        // 5. Save enrollment.
        // ---------------------------------------------------------
        return enrollmentRepository.save(
                enrollment
        );
    }


    /*
     * =========================================================
     * GET MY ENROLLMENTS
     * =========================================================
     */
    public List<Enrollment> getMyEnrollments(
            String studentId
    ) {

        return enrollmentRepository
                .findByStudentId(studentId);
    }


    /*
     * =========================================================
     * CHECK COURSE ACCESS
     * =========================================================
     */
    public boolean isStudentEnrolled(
            String courseId,
            String studentId
    ) {

        return enrollmentRepository
                .findByStudentIdAndCourseId(
                        studentId,
                        courseId
                )
                .map(Enrollment::isActive)
                .orElse(false);
    }


    /*
     * =========================================================
     * MARK COURSE AS COMPLETED
     * =========================================================
     *
     * This method is called when the student has completed
     * every lesson in the course.
     *
     * IMPORTANT:
     * We keep active = true.
     *
     * Completing a course should NOT remove the student's
     * access to the course.
     */
    public Enrollment markCourseCompleted(
            String courseId,
            String studentId
    ) {

        Enrollment enrollment =
                enrollmentRepository
                        .findByStudentIdAndCourseId(
                                studentId,
                                courseId
                        )
                        .orElseThrow(() ->
                                new CourseEnrollmentAccessDeniedException(
                                        "You are not enrolled in this course"
                                )
                        );


        // ---------------------------------------------------------
        // Make sure the enrollment is active.
        // ---------------------------------------------------------
        if (!enrollment.isActive()) {

            throw new CourseEnrollmentAccessDeniedException(
                    "Your enrollment is no longer active"
            );
        }


        // ---------------------------------------------------------
        // Avoid changing the completion timestamp if the
        // course has already been completed.
        // ---------------------------------------------------------
        if (!enrollment.isCompleted()) {

            enrollment.setCompleted(true);

            enrollment.setCompletedAt(
                    LocalDateTime.now()
            );

            enrollment =
                    enrollmentRepository.save(
                            enrollment
                    );
        }


        return enrollment;
    }
}