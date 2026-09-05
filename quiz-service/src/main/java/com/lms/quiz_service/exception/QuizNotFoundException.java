package com.lms.quiz_service.exception;

public class QuizNotFoundException extends RuntimeException {

    public QuizNotFoundException(String message) {
        super(message);
    }
}