package com.lms.course_service.repository;

import com.lms.course_service.model.Lesson;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LessonRepository extends MongoRepository<Lesson,String> {

    // Get all lessons of a section in the correct order.
    List<Lesson> findBySectionIdOrderByOrderIndexAsc(
            String sectionId
    );

    // Find a lesson only if it belongs to the given section.
    Optional<Lesson> findByIdAndSectionId(
            String lessonId,
            String sectionId
    );

    // Check whether the section already contains
    // a lesson with the same title.
    boolean existsBySectionIdAndTitle(
            String sectionId,
            String title
    );

    // Check whether the section already uses
    // the requested order index.
    boolean existsBySectionIdAndOrderIndex(
            String sectionId,
            Integer orderIndex
    );
    
    long countBySectionId(String sectionId);
}
