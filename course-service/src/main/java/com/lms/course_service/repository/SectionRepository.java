package com.lms.course_service.repository;

import com.lms.course_service.model.Section;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface SectionRepository
        extends MongoRepository<Section, String> {

    List<Section> findByCourseIdOrderByOrderIndexAsc(
            String courseId
    );

    Optional<Section> findByIdAndCourseId(
            String sectionId,
            String courseId
    );

    boolean existsByCourseIdAndTitle(
            String courseId,
            String title
    );

    boolean existsByCourseIdAndOrderIndex(
            String courseId,
            Integer orderIndex
    );

	List<Section> findByCourseId(String courseId);


}
