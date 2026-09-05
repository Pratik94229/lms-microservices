package com.lms.course_service.service;

import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.exception.LessonNotFoundException;
import com.lms.course_service.model.Lesson;
import com.lms.course_service.model.LessonProgress;
import com.lms.course_service.model.Section;
import com.lms.course_service.repository.LessonProgressRepository;
import com.lms.course_service.repository.LessonRepository;
import com.lms.course_service.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final SectionRepository sectionRepository;
    private final EnrollmentService enrollmentService;


    /*
     * =========================================================
     * MARK LESSON AS COMPLETED
     * =========================================================
     */
    public LessonProgress markLessonCompleted(
            String lessonId,
            String studentId
    ) {

        // ---------------------------------------------------------
        // 1. Find the lesson.
        // ---------------------------------------------------------
        Lesson lesson =
                lessonRepository.findById(lessonId)
                        .orElseThrow(() ->
                                new LessonNotFoundException(
                                        "Lesson not found"
                                )
                        );


        // ---------------------------------------------------------
        // 2. Find the section containing the lesson.
        // ---------------------------------------------------------
        Section section =
                sectionRepository.findById(
                        lesson.getSectionId()
                ).orElseThrow(() ->
                        new IllegalStateException(
                                "Section not found"
                        )
                );


        // ---------------------------------------------------------
        // 3. Get the course ID.
        // ---------------------------------------------------------
        String courseId = section.getCourseId();


        // ---------------------------------------------------------
        // 4. Verify that the student is enrolled
        //    in the course.
        // ---------------------------------------------------------
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


        // ---------------------------------------------------------
        // 5. Check whether progress already exists.
        // ---------------------------------------------------------
        LessonProgress progress =
                lessonProgressRepository
                        .findByStudentIdAndLessonId(
                                studentId,
                                lessonId
                        )
                        .orElseGet(() ->
                                LessonProgress.builder()
                                        .studentId(studentId)
                                        .lessonId(lessonId)
                                        .courseId(courseId)
                                        .build()
                        );


        // ---------------------------------------------------------
        // 6. Mark the lesson as completed.
        // ---------------------------------------------------------
        progress.setCompleted(true);

        progress.setCompletedAt(
                progress.getCompletedAt() == null
                        ? LocalDateTime.now()
                        : progress.getCompletedAt()
        );


        // ---------------------------------------------------------
        // 7. Save lesson progress.
        // ---------------------------------------------------------
        LessonProgress savedProgress =
                lessonProgressRepository.save(
                        progress
                );


        // ---------------------------------------------------------
        // 8. Check whether the entire course is completed.
        // ---------------------------------------------------------
        long completedLessons =
                lessonProgressRepository
                        .countByStudentIdAndCourseIdAndCompleted(
                                studentId,
                                courseId,
                                true
                        );


        List<Section> sections =
                sectionRepository
                        .findByCourseIdOrderByOrderIndexAsc(
                                courseId
                        );


        long totalLessons = 0;

        for (Section courseSection : sections) {

            totalLessons +=
                    lessonRepository
                            .findBySectionIdOrderByOrderIndexAsc(
                                    courseSection.getId()
                            )
                            .size();
        }


        // ---------------------------------------------------------
        // 9. If every lesson is completed, mark the enrollment
        //    as completed.
        //
        //    We intentionally require totalLessons > 0 so that
        //    an empty course cannot accidentally become completed.
        // ---------------------------------------------------------
        if (
                totalLessons > 0 &&
                completedLessons >= totalLessons
        ) {

            enrollmentService.markCourseCompleted(
                    courseId,
                    studentId
            );
        }


        // ---------------------------------------------------------
        // 10. Return the saved lesson progress.
        // ---------------------------------------------------------
        return savedProgress;
    }


    /*
     * =========================================================
     * GET MY COURSE PROGRESS
     * =========================================================
     */
    public double getCourseProgress(
            String courseId,
            String studentId
    ) {

        // ---------------------------------------------------------
        // 1. Verify enrollment.
        // ---------------------------------------------------------
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


        // ---------------------------------------------------------
        // 2. Get all lessons completed by the student
        //    in this course.
        // ---------------------------------------------------------
        long completedLessons =
                lessonProgressRepository
                        .countByStudentIdAndCourseIdAndCompleted(
                                studentId,
                                courseId,
                                true
                        );


        // ---------------------------------------------------------
        // 3. Get total number of lessons in the course.
        // ---------------------------------------------------------
        List<Section> sections =
                sectionRepository
                        .findByCourseIdOrderByOrderIndexAsc(
                                courseId
                        );

        long totalLessons = 0;

        for (Section section : sections) {

            totalLessons +=
                    lessonRepository
                            .findBySectionIdOrderByOrderIndexAsc(
                                    section.getId()
                            )
                            .size();
        }


        // ---------------------------------------------------------
        // 4. Avoid division by zero.
        // ---------------------------------------------------------
        if (totalLessons == 0) {
            return 0.0;
        }


        // ---------------------------------------------------------
        // 5. Calculate percentage.
        // ---------------------------------------------------------
        return ((double) completedLessons / totalLessons) * 100.0;
    }


    /*
     * =========================================================
     * GET COMPLETED LESSONS
     * =========================================================
     */
    public List<LessonProgress> getMyCourseProgressRecords(
            String courseId,
            String studentId
    ) {

        // Verify enrollment first.
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

        return lessonProgressRepository
                .findByStudentIdAndCourseId(
                        studentId,
                        courseId
                );
    }
}