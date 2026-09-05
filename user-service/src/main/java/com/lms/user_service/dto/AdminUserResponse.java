package com.lms.user_service.dto;

import com.lms.user_service.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserResponse {

    private User user;

    private List<String> roles;
}