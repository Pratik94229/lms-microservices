package com.lms.course_service.repository;


import com.lms.course_service.model.Course;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends MongoRepository<Course, String> {

    List<Course> findByInstructorId(String instructorId);

    List<Course> findByPublishedTrue();

    Optional<Course> findByIdAndInstructorId(
            String id,
            String instructorId
    );


}
