package com.lms.course_service.controller;

import com.lms.course_service.dto.LessonCreateRequest;
import com.lms.course_service.dto.LessonUpdateRequest;
import com.lms.course_service.model.Lesson;
import com.lms.course_service.security.JwtPrincipal;
import com.lms.course_service.service.LessonService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sections/{sectionId}/lessons")
public class LessonController {

    private final LessonService lessonService;

    /*
     * Create a new lesson inside a section.
     *
     * Only instructors can create lessons.
     *
     * The service layer additionally verifies that
     * the instructor owns the course containing the section.
     */
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Lesson createLesson(
            @PathVariable String sectionId,
            @Valid @RequestBody LessonCreateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        return lessonService.createLesson(
                sectionId,
                instructorId,
                request.getTitle(),
                request.getDescription(),
                request.getContent(),
                request.getVideoUrl(),
                request.getDuration(),
                request.getOrderIndex()
        );
    }

    /*
     * Get all lessons belonging to a section.
     *
     * Lessons are returned according to orderIndex.
     */
    @GetMapping
    public List<Lesson> getLessons(
            @PathVariable String sectionId
    ) {

        return lessonService.getLessonsBySection(
                sectionId
        );
    }

    /*
     * Update an existing lesson.
     *
     * Only an instructor can update lessons.
     * The service verifies ownership of the course.
     */
    @PutMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Lesson updateLesson(
            @PathVariable String sectionId,
            @PathVariable String lessonId,
            @Valid @RequestBody LessonUpdateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        return lessonService.updateLesson(
                lessonId,
                sectionId,
                instructorId,
                request.getTitle(),
                request.getDescription(),
                request.getContent(),
                request.getVideoUrl(),
                request.getDuration(),
                request.getOrderIndex()
        );
    }

    /*
     * Delete a lesson.
     *
     * Only instructors can delete lessons.
     * The service verifies course ownership.
     */
    @DeleteMapping("/{lessonId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteLesson(
            @PathVariable String sectionId,
            @PathVariable String lessonId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        lessonService.deleteLesson(
                lessonId,
                sectionId,
                instructorId
        );

        return ResponseEntity.noContent().build();
    }

    /*
     * =========================================================
     * GET LESSONS FOR ENROLLED STUDENT
     * =========================================================
     *
     * Only enrolled students can access lessons
     * belonging to a course.
     */
    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Lesson> getLessonsForStudent(
            @PathVariable String sectionId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        return lessonService.getLessonsForStudent(
                sectionId,
                studentId
        );
    }
}