package com.lms.course_service.exception;


public class LessonNotFoundException extends RuntimeException {

    public LessonNotFoundException(String message) {
        super(message);
    }
}