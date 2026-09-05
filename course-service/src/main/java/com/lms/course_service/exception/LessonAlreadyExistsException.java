package com.lms.course_service.exception;

public class LessonAlreadyExistsException extends RuntimeException {

    public LessonAlreadyExistsException(String message) {
        super(message);
    }
}
