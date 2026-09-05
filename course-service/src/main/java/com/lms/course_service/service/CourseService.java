package com.lms.course_service.service;

import com.lms.course_service.client.UserServiceClient;
import com.lms.course_service.dto.CourseAnalyticsResponse;
import com.lms.course_service.dto.StudentCourseAnalyticsResponse;
import com.lms.course_service.dto.UserResponse;
import com.lms.course_service.exception.CourseAccessDeniedException;
import com.lms.course_service.exception.CourseNotFoundException;
import com.lms.course_service.model.Course;
import com.lms.course_service.model.Enrollment;
import com.lms.course_service.model.Section;
import com.lms.course_service.repository.CourseRepository;
import com.lms.course_service.repository.EnrollmentRepository;
import com.lms.course_service.repository.LessonProgressRepository;
import com.lms.course_service.repository.LessonRepository;
import com.lms.course_service.repository.SectionRepository;

import lombok.AllArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    private final SectionRepository sectionRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserServiceClient userServiceClient;


    /*
     * =========================================================
     * CREATE COURSE
     * =========================================================
     */
    public Course createCourse(
            String instructorId,
            String instructorUsername,
            String title,
            String description,
            Double price
    ) {

        Course course = new Course();

        course.setTitle(title);
        course.setDescription(description);
        course.setInstructorId(instructorId);
        course.setInstructorUsername(instructorUsername);
        course.setPrice(price);
        course.setPublished(false);
        course.setCreatedAt(LocalDateTime.now());

        return courseRepository.save(course);
    }


    /*
     * =========================================================
     * GET COURSES BY INSTRUCTOR
     * =========================================================
     */
    public List<Course> getCoursesByInstructor(String instructorId) {

        return courseRepository.findByInstructorId(instructorId);
    }


    /*
     * =========================================================
     * GET PUBLISHED COURSES
     * =========================================================
     */
    public List<Course> getPublishedCourses() {

        return courseRepository.findByPublishedTrue();
    }


    /*
     * =========================================================
     * PUBLISH COURSE
     * =========================================================
     */
    public Course publishCourse(
            String courseId,
            String instructorId
    ) {

        Course course = courseRepository
                .findByIdAndInstructorId(
                        courseId,
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseNotFoundException(
                                "Course not found"
                        )
                );

        course.setPublished(true);

        return courseRepository.save(course);
    }


    /*
     * =========================================================
     * GET COURSE BY ID
     * =========================================================
     */
    public Course getCourseById(
            String courseId,
            String requesterId
    ) {

        Course course = courseRepository
                .findById(courseId)
                .orElseThrow(() ->
                        new CourseNotFoundException(
                                "Course not found"
                        )
                );

        if (course.isPublished()) {
            return course;
        }

        if (course.getInstructorId().equals(requesterId)) {
            return course;
        }

        throw new CourseAccessDeniedException(
                "You are not allowed to view this course"
        );
    }


    /*
     * =========================================================
     * UPDATE COURSE
     * =========================================================
     */
    public Course updateCourse(
            String courseId,
            String instructorId,
            String title,
            String description,
            Double price
    ) {

        Course course = courseRepository
                .findByIdAndInstructorId(
                        courseId,
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        course.setTitle(title);
        course.setDescription(description);
        course.setPrice(price);

        return courseRepository.save(course);
    }


    /*
     * =========================================================
     * DELETE COURSE
     * =========================================================
     */
    public void deleteCourse(
            String courseId,
            String instructorId
    ) {

        Course course = courseRepository
                .findByIdAndInstructorId(
                        courseId,
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        courseRepository.delete(course);
    }


    /*
     * =========================================================
     * COURSE ANALYTICS
     * =========================================================
     */
    public CourseAnalyticsResponse getCourseAnalytics(
            String courseId,
            String instructorId
    ) {

        Course course = courseRepository
                .findByIdAndInstructorId(
                        courseId,
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        long totalStudents =
                enrollmentRepository.countByCourseId(
                        courseId
                );

        long completedStudents =
                enrollmentRepository
                        .countByCourseIdAndCompleted(
                                courseId,
                                true
                        );

        long inProgressStudents =
                Math.max(
                        totalStudents - completedStudents,
                        0
                );

        double completionPercentage = 0.0;

        if (totalStudents > 0) {

            completionPercentage =
                    (completedStudents * 100.0)
                            / totalStudents;
        }

        return CourseAnalyticsResponse
                .builder()
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .totalStudents(totalStudents)
                .completedStudents(completedStudents)
                .inProgressStudents(inProgressStudents)
                .completionPercentage(completionPercentage)
                .build();
    }


    /*
     * =========================================================
     * STUDENT COURSE ANALYTICS
     * =========================================================
     *
     * Returns individual progress for every student enrolled
     * in the instructor's course.
     */
    public List<StudentCourseAnalyticsResponse> getStudentCourseAnalytics(
            String courseId,
            String instructorId
    ) {

        // ---------------------------------------------------------
        // 1. Verify that the instructor owns the course.
        // ---------------------------------------------------------
        Course course = courseRepository
                .findByIdAndInstructorId(
                        courseId,
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );


        // ---------------------------------------------------------
        // 2. Get all enrollments for this course.
        // ---------------------------------------------------------
        List<Enrollment> enrollments =
                enrollmentRepository.findByCourseId(
                        courseId
                );


        // ---------------------------------------------------------
        // 3. Get all sections belonging to this course.
        // ---------------------------------------------------------
        List<Section> sections =
                sectionRepository.findByCourseId(
                        courseId
                );


        // ---------------------------------------------------------
        // 4. Calculate total lessons in the course.
        // ---------------------------------------------------------
        long totalLessons = sections.stream()
                .mapToLong(section ->
                        lessonRepository.countBySectionId(
                                section.getId()
                        )
                )
                .sum();


        // ---------------------------------------------------------
        // 5. Build analytics for every enrolled student.
        // ---------------------------------------------------------
        return enrollments.stream()
                .map(enrollment -> {

                    /*
                     * -------------------------------------------------
                     * Get student details from User Service.
                     *
                     * Some old/stale enrollments may reference a
                     * Keycloak user that no longer exists in the
                     * User Service database.
                     *
                     * We don't want one missing user to break the
                     * entire analytics page.
                     * -------------------------------------------------
                     */
                    UserResponse student = null;

                    try {

                        student =
                                userServiceClient
                                        .getUserByKeycloakUserId(
                                                enrollment.getStudentId()
                                        );

                    } catch (Exception ex) {

                        // Keep the enrollment in analytics.
                        // The username/email will show as fallback
                        // values below.
                    }


                    // -------------------------------------------------
                    // Count completed lessons for this student.
                    // -------------------------------------------------
                    long completedLessons =
                            lessonProgressRepository
                                    .countByStudentIdAndCourseIdAndCompleted(
                                            enrollment.getStudentId(),
                                            courseId,
                                            true
                                    );


                    // -------------------------------------------------
                    // Calculate progress percentage.
                    // -------------------------------------------------
                    double progressPercentage = 0.0;

                    if (totalLessons > 0) {

                        progressPercentage =
                                (completedLessons * 100.0)
                                        / totalLessons;
                    }


                    // -------------------------------------------------
                    // Build student analytics response.
                    // -------------------------------------------------
                    return StudentCourseAnalyticsResponse
                            .builder()

                            .studentId(
                                    enrollment.getStudentId()
                            )

                            .studentUsername(
                                    student != null
                                            ? student.getUsername()
                                            : "Unknown Student"
                            )

                            .studentEmail(
                                    student != null
                                            ? student.getEmail()
                                            : "User not found"
                            )

                            .courseId(
                                    course.getId()
                            )

                            .enrolledAt(
                                    enrollment.getEnrolledAt()
                            )

                            .completedLessons(
                                    completedLessons
                            )

                            .totalLessons(
                                    totalLessons
                            )

                            .progressPercentage(
                                    progressPercentage
                            )

                            .completed(
                                    enrollment.isCompleted()
                            )

                            .completedAt(
                                    enrollment.getCompletedAt()
                            )

                            .build();
                })
                .toList();
    }
}