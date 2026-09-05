package com.lms.course_service.service;


import com.lms.course_service.exception.*;
import com.lms.course_service.model.Course;
import com.lms.course_service.model.Lesson;
import com.lms.course_service.model.Section;
import com.lms.course_service.repository.CourseRepository;
import com.lms.course_service.repository.LessonRepository;
import com.lms.course_service.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentService enrollmentService;

    /*
     * Create a new lesson inside a section.
     *
     * The instructorId comes from the authenticated JWT.
     *
     * We verify:
     *
     * Instructor
     *     ↓
     * Course ownership
     *     ↓
     * Section
     *     ↓
     * Lesson
     */
    public Lesson createLesson(
            String sectionId,
            String instructorId,
            String title,
            String description,
            String content,
            String videoUrl,
            Integer duration,
            Integer orderIndex
    ) {

        // Find the section first.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Find the course belonging to this section
        // and verify that the authenticated instructor
        // owns that course.
        Course course = courseRepository
                .findByIdAndInstructorId(
                        section.getCourseId(),
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        // Check whether another lesson with the
        // same title already exists in this section.
        if (lessonRepository.existsBySectionIdAndTitle(
                sectionId,
                title
        )) {

            throw new LessonAlreadyExistsException(
                    "A lesson with this title already exists in this section"
            );
        }

        // Check whether another lesson is already
        // using the requested order index.
        if (lessonRepository.existsBySectionIdAndOrderIndex(
                sectionId,
                orderIndex
        )) {

            throw new LessonWithSameIndexException(
                    "A lesson with this order index already exists in this section"
            );
        }

        // Create the lesson.
        Lesson lesson = new Lesson();

        lesson.setSectionId(section.getId());
        lesson.setTitle(title);
        lesson.setDescription(description);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setDuration(duration);
        lesson.setOrderIndex(orderIndex);

        // Save the lesson in MongoDB.
        return lessonRepository.save(lesson);
    }


    /*
     * Get all lessons belonging to a section.
     *
     * Lessons are returned according to orderIndex.
     */
    public List<Lesson> getLessonsBySection(
            String sectionId
    ) {

        return lessonRepository
                .findBySectionIdOrderByOrderIndexAsc(sectionId);
    }

    public Lesson updateLesson(
            String lessonId,
            String sectionId,
            String instructorId,
            String title,
            String description,
            String content,
            String videoUrl,
            Integer duration,
            Integer orderIndex
    ) {

        // Find the lesson.
        Lesson lesson = lessonRepository
                .findById(lessonId)
                .orElseThrow(() ->
                        new LessonNotFoundException(
                                "Lesson not found"
                        )
                );

        // Make sure the lesson actually belongs
        // to the section supplied in the URL.
        if (!lesson.getSectionId().equals(sectionId)) {

            throw new LessonNotFoundException(
                    "Lesson not found in this section"
            );
        }

        // Find the section.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Verify that the authenticated instructor
        // owns the course containing this section.
        courseRepository
                .findByIdAndInstructorId(
                        section.getCourseId(),
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        // Check duplicate title.
        //
        // Allow the lesson to keep its current title.
        if (!lesson.getTitle().equals(title)
                && lessonRepository.existsBySectionIdAndTitle(
                sectionId,
                title
        )) {

            throw new LessonAlreadyExistsException(
                    "A lesson with this title already exists in this section"
            );
        }

        // Check duplicate order index.
        //
        // Allow the lesson to keep its current order index.
        if (!lesson.getOrderIndex().equals(orderIndex)
                && lessonRepository.existsBySectionIdAndOrderIndex(
                sectionId,
                orderIndex
        )) {

            throw new LessonWithSameIndexException(
                    "A lesson with this order index already exists in this section"
            );
        }

        // Update lesson fields.
        lesson.setTitle(title);
        lesson.setDescription(description);
        lesson.setContent(content);
        lesson.setVideoUrl(videoUrl);
        lesson.setDuration(duration);
        lesson.setOrderIndex(orderIndex);

        // Save updated lesson.
        return lessonRepository.save(lesson);
    }

    /*
     * Delete a lesson.
     *
     * Only an instructor who owns the course
     * containing the lesson can delete it.
     *
     * After deletion, remaining lessons are
     * re-numbered so orderIndex remains continuous.
     */
    public void deleteLesson(
            String lessonId,
            String sectionId,
            String instructorId
    ) {

        // Find the lesson.
        Lesson lesson = lessonRepository
                .findById(lessonId)
                .orElseThrow(() ->
                        new LessonNotFoundException(
                                "Lesson not found"
                        )
                );

        // Make sure this lesson actually belongs
        // to the section supplied in the URL.
        if (!lesson.getSectionId().equals(sectionId)) {

            throw new LessonNotFoundException(
                    "Lesson not found in this section"
            );
        }

        // Find the section.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Verify that the authenticated instructor
        // owns the course containing this section.
        courseRepository
                .findByIdAndInstructorId(
                        section.getCourseId(),
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "Course not found or you are not the owner"
                        )
                );

        // Delete the lesson.
        lessonRepository.delete(lesson);

        // Get the remaining lessons in their current order.
        List<Lesson> remainingLessons =
                lessonRepository
                        .findBySectionIdOrderByOrderIndexAsc(
                                sectionId
                        );

        /*
         * First assign temporary negative indexes.
         *
         * This prevents conflicts with the unique
         * sectionId + orderIndex MongoDB index.
         */
        for (int i = 0; i < remainingLessons.size(); i++) {

            Lesson remainingLesson =
                    remainingLessons.get(i);

            remainingLesson.setOrderIndex(-(i + 1));
        }

        // Save temporary indexes.
        lessonRepository.saveAll(remainingLessons);

        /*
         * Assign the final continuous indexes.
         */
        for (int i = 0; i < remainingLessons.size(); i++) {

            Lesson remainingLesson =
                    remainingLessons.get(i);

            remainingLesson.setOrderIndex(i + 1);
        }

        // Save final indexes.
        lessonRepository.saveAll(remainingLessons);
    }

    /*
     * =========================================================
     * GET LESSONS FOR ENROLLED STUDENT
     * =========================================================
     */
    public List<Lesson> getLessonsForStudent(
            String sectionId,
            String studentId
    ) {

        // Find the section.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Verify that the student is enrolled
        // in the course containing this section.
        boolean enrolled =
                enrollmentService.isStudentEnrolled(
                        section.getCourseId(),
                        studentId
                );

        if (!enrolled) {
            throw new CourseEnrollmentAccessDeniedException(
                    "You are not enrolled in this course"
            );
        }

        // Return lessons in order.
        return lessonRepository
                .findBySectionIdOrderByOrderIndexAsc(
                        sectionId
                );
    }
}