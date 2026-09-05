package com.lms.quiz_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class SectionResponse {

    private String id;
    private String courseId;
    private String title;
    private String description;
    private Integer orderIndex;
}
