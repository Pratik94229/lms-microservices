package com.lms.course_service.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(CourseNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCourseNotFound(
            CourseNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(CourseAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(
            CourseAccessDeniedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(SectionAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleSectionAlreadyExists(
            SectionAlreadyExistsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(SectionWithSameIndexException.class)
    public ResponseEntity<Map<String, String>> handleSectionWithSameIndex(
            SectionWithSameIndexException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(SectionNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleSectionNotFound(
            SectionNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }
    @ExceptionHandler(LessonAlreadyExistsException.class)
    public ResponseEntity<Map<String,String>>  handleLessonAlreadyExists(LessonAlreadyExistsException ex){
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(LessonWithSameIndexException.class)
    public ResponseEntity<Map<String,String>> handleLessonWithSameIndexException(LessonWithSameIndexException ex){
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }

    @ExceptionHandler(AlreadyEnrolledException.class)
    public ResponseEntity<Map<String, String>> handleAlreadyEnrolled(
            AlreadyEnrolledException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(CourseEnrollmentAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleCourseEnrollmentAccessDenied(
            CourseEnrollmentAccessDeniedException ex
    ) {
        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", ex.getMessage()));
    }
}
