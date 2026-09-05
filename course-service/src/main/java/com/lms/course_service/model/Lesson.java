package com.lms.course_service.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "lessons")
@CompoundIndex(
        name = "section_title_unique",
        def = "{'sectionId': 1, 'title': 1}",
        unique = true
)
@CompoundIndex(
        name = "section_order_unique",
        def = "{'sectionId': 1, 'orderIndex': 1}",
        unique = true
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Lesson {

    @Id
    private String id;

    private String sectionId;

    private String title;

    private String description;

    private String content;

    private String videoUrl;

    private Integer duration;

    private Integer orderIndex;
}
