package com.lms.quiz_service.exception;

public class ActiveAttemptAlreadyExistsException
        extends RuntimeException {

    public ActiveAttemptAlreadyExistsException(String message) {
        super(message);
    }
}