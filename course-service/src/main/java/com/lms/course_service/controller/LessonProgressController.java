package com.lms.course_service.controller;

import com.lms.course_service.model.LessonProgress;
import com.lms.course_service.security.JwtPrincipal;
import com.lms.course_service.service.LessonProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/progress")
public class LessonProgressController {

    private final LessonProgressService lessonProgressService;

    /*
     * =========================================================
     * MARK LESSON AS COMPLETED
     * =========================================================
     */
    @PostMapping("/lessons/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @ResponseStatus(HttpStatus.OK)
    public LessonProgress markLessonCompleted(
            @PathVariable String lessonId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return lessonProgressService.markLessonCompleted(
                lessonId,
                studentId
        );
    }

    /*
     * =========================================================
     * GET COURSE PROGRESS PERCENTAGE
     * =========================================================
     */
    @GetMapping("/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public double getCourseProgress(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return lessonProgressService.getCourseProgress(
                courseId,
                studentId
        );
    }

    /*
     * =========================================================
     * GET MY COURSE PROGRESS RECORDS
     * =========================================================
     */
    @GetMapping("/courses/{courseId}/lessons")
    @PreAuthorize("hasRole('STUDENT')")
    public List<LessonProgress> getMyCourseProgressRecords(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return lessonProgressService.getMyCourseProgressRecords(
                courseId,
                studentId
        );
    }
}