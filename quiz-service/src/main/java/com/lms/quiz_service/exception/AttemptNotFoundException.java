package com.lms.quiz_service.exception;

public class AttemptNotFoundException
        extends RuntimeException {

    public AttemptNotFoundException(String message) {
        super(message);
    }
}