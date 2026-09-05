package com.lms.course_service.exception;

public class CourseAccessDeniedException extends RuntimeException {

    public CourseAccessDeniedException(String message) {
        super(message);
    }
}
