package com.lms.course_service.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "sections")
@CompoundIndex(
        name = "course_title_unique",
        def = "{'courseId': 1, 'title': 1}",
        unique = true
)
@CompoundIndex(
        name = "course_order_unique",
        def = "{'courseId': 1, 'orderIndex': 1}",
        unique = true
)
public class Section {

    @Id
    private String id;

    private String courseId;

    private String title;

    private String description;

    private Integer orderIndex;

    public Section() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }
}