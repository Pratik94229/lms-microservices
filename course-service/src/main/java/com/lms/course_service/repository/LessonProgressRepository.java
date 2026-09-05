package com.lms.course_service.repository;

import com.lms.course_service.model.LessonProgress;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository
        extends MongoRepository<LessonProgress, String> {

    Optional<LessonProgress> findByStudentIdAndLessonId(
            String studentId,
            String lessonId
    );

    List<LessonProgress> findByStudentIdAndCourseId(
            String studentId,
            String courseId
    );

    long countByStudentIdAndCourseIdAndCompleted(
            String studentId,
            String courseId,
            boolean completed
    );
}