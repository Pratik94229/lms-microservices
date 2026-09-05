package com.lms.course_service.exception;

public class CourseEnrollmentAccessDeniedException
        extends RuntimeException {

    public CourseEnrollmentAccessDeniedException(String message) {
        super(message);
    }
}