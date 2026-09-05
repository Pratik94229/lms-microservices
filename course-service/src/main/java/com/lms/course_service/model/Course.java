package com.lms.course_service.model;


import jakarta.ws.rs.core.Link;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "courses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Course {

    @Id
    private String id;

    private String title;

    private String description;

    private String instructorId;

    private String instructorUsername;

    private Double price;

    private boolean published;

    private LocalDateTime createdAt;

}
