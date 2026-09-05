package com.lms.course_service.service;

import com.lms.course_service.exception.CourseAccessDeniedException;
import com.lms.course_service.exception.SectionAlreadyExistsException;
import com.lms.course_service.exception.SectionNotFoundException;
import com.lms.course_service.exception.SectionWithSameIndexException;
import com.lms.course_service.model.Course;
import com.lms.course_service.model.Section;
import com.lms.course_service.repository.CourseRepository;
import com.lms.course_service.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;
    private final CourseRepository courseRepository;

    /*
     * Create a new section inside a course.
     *
     * The instructorId comes from the authenticated JWT.
     *
     * We first verify that the instructor owns the course.
     */
    public Section createSection(
            String courseId,
            String instructorId,
            String title,
            String description,
            Integer orderIndex
    ) {

        // Verify that the authenticated instructor
        // owns the course.
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

        // Check for duplicate section title.
        if (sectionRepository.existsByCourseIdAndTitle(
                courseId,
                title
        )) {

            throw new SectionAlreadyExistsException(
                    "A section with this title already exists in this course"
            );
        }

        // Check for duplicate order index.
        if (sectionRepository.existsByCourseIdAndOrderIndex(
                courseId,
                orderIndex
        )) {

            throw new SectionWithSameIndexException(
                    "A section with this order index already exists in this course"
            );
        }

        // Create the new section.
        Section section = new Section();

        section.setCourseId(course.getId());
        section.setTitle(title);
        section.setDescription(description);
        section.setOrderIndex(orderIndex);

        // Save section to MongoDB.
        return sectionRepository.save(section);
    }


    /*
     * Get all sections belonging to a course.
     *
     * Sections are returned in orderIndex order.
     */
    public List<Section> getSectionsByCourse(
            String courseId
    ) {

        return sectionRepository
                .findByCourseIdOrderByOrderIndexAsc(courseId);
    }


    /*
     * Update an existing section.
     *
     * Only the instructor who owns the course
     * can update its sections.
     */
    public Section updateSection(
            String sectionId,
            String instructorId,
            String title,
            String description,
            Integer orderIndex
    ) {

        // Find the section.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Verify that the instructor owns
        // the course containing this section.
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

        // Check duplicate title.
        //
        // Allow the section to keep its existing title.
        if (!section.getTitle().equals(title)
                && sectionRepository.existsByCourseIdAndTitle(
                course.getId(),
                title
        )) {

            throw new SectionAlreadyExistsException(
                    "A section with this title already exists in this course"
            );
        }

        // Check duplicate order index.
        //
        // Allow the section to keep its existing order index.
        if (!section.getOrderIndex().equals(orderIndex)
                && sectionRepository.existsByCourseIdAndOrderIndex(
                course.getId(),
                orderIndex
        )) {

            throw new SectionWithSameIndexException(
                    "A section with this order index already exists in this course"
            );
        }

        // Update allowed fields.
        section.setTitle(title);
        section.setDescription(description);
        section.setOrderIndex(orderIndex);

        // Save updated section.
        return sectionRepository.save(section);
    }


    /*
     * Delete a section.
     *
     * After deletion, remaining sections are re-numbered
     * so that orderIndex remains continuous.
     */
    public void deleteSection(
            String sectionId,
            String instructorId
    ) {

        // Find the section.
        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        // Verify that the instructor owns
        // the course containing this section.
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

        // Remember the course ID before deleting.
        String courseId = section.getCourseId();

        // Delete the section.
        sectionRepository.delete(section);

        // Get remaining sections in their current order.
        List<Section> remainingSections =
                sectionRepository
                        .findByCourseIdOrderByOrderIndexAsc(courseId);

        /*
         * Temporarily assign negative indexes.
         *
         * This prevents conflicts with the unique
         * courseId + orderIndex MongoDB index.
         */
        for (int i = 0; i < remainingSections.size(); i++) {

            Section remainingSection =
                    remainingSections.get(i);

            remainingSection.setOrderIndex(-(i + 1));
        }

        // Save temporary indexes.
        sectionRepository.saveAll(remainingSections);

        /*
         * Assign the final continuous indexes.
         */
        for (int i = 0; i < remainingSections.size(); i++) {

            Section remainingSection =
                    remainingSections.get(i);

            remainingSection.setOrderIndex(i + 1);
        }

        // Save final indexes.
        sectionRepository.saveAll(remainingSections);
    }

    /*
     * Get a section by its ID.
     *
     * This method is used when another service,
     * such as Quiz Service, needs section information.
     */
    public Section getSectionById(
            String sectionId
    ) {

        return sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );
    }

    public void verifySectionOwnership(
            String sectionId,
            String instructorId
    ) {

        Section section = sectionRepository
                .findById(sectionId)
                .orElseThrow(() ->
                        new SectionNotFoundException(
                                "Section not found"
                        )
                );

        courseRepository
                .findByIdAndInstructorId(
                        section.getCourseId(),
                        instructorId
                )
                .orElseThrow(() ->
                        new CourseAccessDeniedException(
                                "You are not the owner of this course"
                        )
                );
    }
}