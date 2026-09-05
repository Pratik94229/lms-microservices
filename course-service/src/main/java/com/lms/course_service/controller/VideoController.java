package com.lms.course_service.controller;

import com.cloudinary.utils.ObjectUtils;
import com.lms.course_service.service.CloudinaryService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/videos")
public class VideoController {

    private final CloudinaryService cloudinaryService;

    public VideoController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public ResponseEntity<?> uploadVideo(
            @RequestParam("file") MultipartFile file
    ) {
        try {

            Map result = cloudinaryService.uploadVideo(file);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            Map.of(
                                    "message", "Video uploaded successfully",
                                    "publicId", result.get("public_id"),
                                    "videoUrl", result.get("secure_url"),
                                    "resourceType", result.get("resource_type"),
                                    "format", result.get("format"),
                                    "duration", result.get("duration")
                            )
                    );

        } catch (IllegalArgumentException ex) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "message", ex.getMessage()
                            )
                    );

        } catch (IOException ex) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message", "Failed to upload video"
                            )
                    );
        }
    }
}