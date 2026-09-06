package com.lms.course_service.controller;

import com.lms.course_service.dto.SectionCreateRequest;
import com.lms.course_service.dto.SectionUpdateRequest;
import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.model.Section;
import com.lms.course_service.security.JwtPrincipal;
import com.lms.course_service.service.EnrollmentService;
import com.lms.course_service.service.SectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses/{courseId}/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;
    private final EnrollmentService enrollmentService;

    /*
     * Create a new section inside a course.
     *
     * Only instructors are allowed to create sections.
     */
    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Section createSection(
            @PathVariable String courseId,
            @Valid @RequestBody SectionCreateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        return sectionService.createSection(
                courseId,
                instructorId,
                request.getTitle(),
                request.getDescription(),
                request.getOrderIndex()
        );
    }

    /*
     * Get all sections belonging to a course.
     */
    @GetMapping
    public List<Section> getSections(
            @PathVariable String courseId
    ) {

        return sectionService.getSectionsByCourse(
                courseId
        );
    }

    /*
     * =========================================================
     * GET SECTIONS FOR ENROLLED STUDENT
     * =========================================================
     */
    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    public List<Section> getStudentSections(
            @PathVariable String courseId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String studentId = principal.userId();

        boolean enrolled =
                enrollmentService.isStudentEnrolled(
                        courseId,
                        studentId
                );

        if (!enrolled) {
            throw new CourseEnrollmentAccessDeniedException(
                    "You are not enrolled in this course"
            );
        }

        return sectionService.getSectionsByCourse(
                courseId
        );
    }

    /*
     * Update an existing section.
     */
    @PutMapping("/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Section updateSection(
            @PathVariable String courseId,
            @PathVariable String sectionId,
            @Valid @RequestBody SectionUpdateRequest request,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        return sectionService.updateSection(
                sectionId,
                instructorId,
                request.getTitle(),
                request.getDescription(),
                request.getOrderIndex()
        );
    }

    /*
     * Delete a section.
     */
    @DeleteMapping("/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteSection(
            @PathVariable String courseId,
            @PathVariable String sectionId,
            @AuthenticationPrincipal JwtPrincipal principal
    ) {

        String instructorId = principal.userId();

        sectionService.deleteSection(
                sectionId,
                instructorId
        );

        return ResponseEntity.noContent().build();
    }
}