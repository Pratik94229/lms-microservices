package com.lms.course_service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;

    private String keycloakUserId;

    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private String phone;

    private String profileImage;
}