package com.lms.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangeUserRoleRequest {

    @NotBlank(message = "Role is required")
    @Pattern(
            regexp = "STUDENT|INSTRUCTOR|ADMIN",
            message = "Role must be STUDENT, INSTRUCTOR, or ADMIN"
    )
    private String role;
}