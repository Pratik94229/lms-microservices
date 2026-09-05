package com.lms.quiz_service.client;

import com.lms.quiz_service.config.FeignClientConfig;
import com.lms.quiz_service.dto.SectionResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(
        name = "COURSE-SERVICE",
        configuration = FeignClientConfig.class
)
public interface CourseServiceClient {

    /*
     * =========================================================
     * SECTION INFORMATION
     * =========================================================
     */

    /*
     * Get section metadata.
     */
    @GetMapping("/api/sections/{sectionId}")
    SectionResponse getSectionById(
            @PathVariable String sectionId
    );


    /*
     * =========================================================
     * COURSE SECTIONS
     * =========================================================
     */

    /*
     * Get all sections belonging to a course.
     *
     * The authenticated instructor's JWT is automatically
     * forwarded by FeignClientConfig.
     */
    @GetMapping("/api/courses/{courseId}/sections")
    List<SectionResponse> getSectionsByCourse(
            @PathVariable String courseId
    );


    /*
     * =========================================================
     * INSTRUCTOR OWNERSHIP
     * =========================================================
     */

    /*
     * Verify that the authenticated instructor owns the
     * course containing this section.
     *
     * The JWT is automatically forwarded by
     * FeignClientConfig.
     */
    @GetMapping("/api/sections/{sectionId}/access")
    void verifySectionOwnership(
            @PathVariable String sectionId
    );


    /*
     * =========================================================
     * STUDENT ENROLLMENT
     * =========================================================
     */

    /*
     * Verify that the authenticated student is enrolled
     * in the specified course.
     */
    @GetMapping("/api/enrollments/courses/{courseId}/access")
    void verifyStudentEnrollment(
            @PathVariable String courseId
    );
}