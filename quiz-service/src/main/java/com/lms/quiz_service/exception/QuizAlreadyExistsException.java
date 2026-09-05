package com.lms.quiz_service.exception;


public class QuizAlreadyExistsException extends RuntimeException {

    public QuizAlreadyExistsException(String message) {
        super(message);
    }
}
