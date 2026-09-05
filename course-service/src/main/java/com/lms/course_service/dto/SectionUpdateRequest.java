package com.lms.course_service.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class SectionUpdateRequest {

    @NotBlank(message = "Section title is required")
    @Size(
            max = 150,
            message = "Section title cannot exceed 150 characters"
    )
    private String title;

    @Size(
            max = 1000,
            message = "Section description cannot exceed 1000 characters"
    )
    private String description;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    public SectionUpdateRequest() {
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
