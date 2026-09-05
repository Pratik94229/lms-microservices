package com.lms.course_service.controller;

import com.lms.course_service.model.Section;
import com.lms.course_service.service.SectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/sections")
public class SectionLookupController {

    private final SectionService sectionService;

    /*
     * Get a section directly by its ID.
     *
     * This endpoint is used by other microservices,
     * such as Quiz Service.
     */
    @GetMapping("/{sectionId}")
    public Section getSectionById(
            @PathVariable String sectionId
    ) {

        return sectionService.getSectionById(sectionId);
    }


    /*
     * Verify that the authenticated instructor owns
     * the course containing this section.
     *
     * This endpoint is used by other microservices,
     * such as Quiz Service.
     */
    @GetMapping("/{sectionId}/access")
    public ResponseEntity<Void> verifySectionOwnership(
            @PathVariable String sectionId,
            @AuthenticationPrincipal Jwt jwt
    ) {

        String instructorId = jwt.getSubject();

        sectionService.verifySectionOwnership(
                sectionId,
                instructorId
        );

        return ResponseEntity.ok().build();
    }
}