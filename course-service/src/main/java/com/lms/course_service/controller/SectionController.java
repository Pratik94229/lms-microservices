package com.lms.course_service.controller;

import com.lms.course_service.dto.SectionCreateRequest;
import com.lms.course_service.dto.SectionUpdateRequest;
import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.model.Section;
import com.lms.course_service.service.EnrollmentService;
import com.lms.course_service.service.SectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
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
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get the authenticated user's Keycloak ID
        // directly from the JWT.
        String instructorId = jwt.getSubject();

        // Pass the course ID, authenticated instructor ID,
        // and section data to the service layer.
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
     *
     * For now this endpoint is available to authenticated
     * users. Later we'll add enrollment/published-course
     * checks for students.
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
     *
     * Only enrolled students can access the learning
     * sections of a course.
     */
    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT') or hasRole('INSTRUCTOR')")
    public List<Section> getStudentSections(
            @PathVariable String courseId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String studentId = jwt.getSubject();

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
     *
     * Only an instructor can update a section.
     * The service layer verifies that the instructor
     * owns the course containing the section.
     */
    @PutMapping("/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public Section updateSection(
            @PathVariable String courseId,
            @PathVariable String sectionId,
            @Valid @RequestBody SectionUpdateRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get the authenticated instructor's Keycloak ID
        // from the JWT.
        String instructorId = jwt.getSubject();

        // Update the section through the service layer.
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
     *
     * Only an instructor can delete a section.
     * The service layer verifies that the instructor
     * owns the course containing the section.
     */
    @DeleteMapping("/{sectionId}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<Void> deleteSection(
            @PathVariable String courseId,
            @PathVariable String sectionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        // Get authenticated instructor ID from JWT.
        String instructorId = jwt.getSubject();

        // Delete the section.
        sectionService.deleteSection(
                sectionId,
                instructorId
        );

        // Return HTTP 204 No Content.
        return ResponseEntity.noContent().build();
    }


}