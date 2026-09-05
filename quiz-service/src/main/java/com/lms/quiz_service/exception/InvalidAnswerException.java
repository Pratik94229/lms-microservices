package com.lms.quiz_service.exception;

public class InvalidAnswerException
        extends RuntimeException {

    public InvalidAnswerException(String message) {
        super(message);
    }
}