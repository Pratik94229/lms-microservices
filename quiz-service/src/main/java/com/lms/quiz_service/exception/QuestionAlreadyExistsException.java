package com.lms.quiz_service.exception;

public class QuestionAlreadyExistsException
        extends RuntimeException {

    public QuestionAlreadyExistsException(String message) {
        super(message);
    }
}