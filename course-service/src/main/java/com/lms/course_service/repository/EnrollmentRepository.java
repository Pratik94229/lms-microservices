package com.lms.course_service.repository;

import com.lms.course_service.model.Enrollment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository
        extends MongoRepository<Enrollment, String> {

    /*
     * Find a student's enrollment in a particular course.
     */
    Optional<Enrollment> findByStudentIdAndCourseId(
            String studentId,
            String courseId
    );

    /*
     * Get all enrollments belonging to a student.
     */
    List<Enrollment> findByStudentId(String studentId);

    /*
     * Get all students enrolled in a course.
     */
    List<Enrollment> findByCourseId(String courseId);

    /*
     * Check whether a student is enrolled in a course.
     */
    boolean existsByStudentIdAndCourseId(
            String studentId,
            String courseId
    );

    /*
     * Count all students enrolled in a course.
     */
    long countByCourseId(String courseId);

    /*
     * Count students who completed a course.
     */
    long countByCourseIdAndCompleted(
            String courseId,
            boolean completed
    );
}