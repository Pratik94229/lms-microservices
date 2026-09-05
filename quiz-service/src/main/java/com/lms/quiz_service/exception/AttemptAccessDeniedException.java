package com.lms.quiz_service.exception;

public class AttemptAccessDeniedException
        extends RuntimeException {

    public AttemptAccessDeniedException(String message) {
        super(message);
    }
}