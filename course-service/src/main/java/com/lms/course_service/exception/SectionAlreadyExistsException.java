package com.lms.course_service.exception;


public class SectionAlreadyExistsException extends RuntimeException {

    public SectionAlreadyExistsException(String message) {
        super(message);
    }
}