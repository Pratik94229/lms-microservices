package com.lms.quiz_service.exception;

public class AttemptAlreadySubmittedException
        extends RuntimeException {

    public AttemptAlreadySubmittedException(String message) {
        super(message);
    }
}