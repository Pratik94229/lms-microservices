package com.lms.course_service.exception;

public class LessonWithSameIndexException extends RuntimeException{
    public LessonWithSameIndexException(String messsage){
        super(messsage);
    }
}
