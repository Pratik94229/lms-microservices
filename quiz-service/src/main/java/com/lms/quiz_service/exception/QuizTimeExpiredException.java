package com.lms.quiz_service.exception;

public class QuizTimeExpiredException
        extends RuntimeException {

    public QuizTimeExpiredException(String message) {
        super(message);
    }
}