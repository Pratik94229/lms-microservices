package com.lms.quiz_service.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * =========================================================
     * QUIZ ALREADY EXISTS
     * =========================================================
     */
    @ExceptionHandler(QuizAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleQuizAlreadyExists(
            QuizAlreadyExistsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * ATTEMPT ALREADY SUBMITTED
     * =========================================================
     */
    @ExceptionHandler(AttemptAlreadySubmittedException.class)
    public ResponseEntity<Map<String, String>> handleAttemptAlreadySubmitted(
            AttemptAlreadySubmittedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * ATTEMPT NOT FOUND
     * =========================================================
     */
    @ExceptionHandler(AttemptNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleAttemptNotFound(
            AttemptNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * ATTEMPT ACCESS DENIED
     * =========================================================
     */
    @ExceptionHandler(AttemptAccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAttemptAccessDenied(
            AttemptAccessDeniedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * INVALID ANSWER
     * =========================================================
     */
    @ExceptionHandler(InvalidAnswerException.class)
    public ResponseEntity<Map<String, String>> handleInvalidAnswer(
            InvalidAnswerException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * ACTIVE ATTEMPT ALREADY EXISTS
     * =========================================================
     */
    @ExceptionHandler(ActiveAttemptAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleActiveAttemptAlreadyExists(
            ActiveAttemptAlreadyExistsException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }


    /*
     * =========================================================
     * QUIZ TIME EXPIRED
     * =========================================================
     */
    @ExceptionHandler(QuizTimeExpiredException.class)
    public ResponseEntity<Map<String, String>> handleQuizTimeExpired(
            QuizTimeExpiredException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                        "error", ex.getMessage()
                ));
    }
}