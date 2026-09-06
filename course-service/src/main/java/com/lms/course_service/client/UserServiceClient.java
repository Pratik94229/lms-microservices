package com.lms.course_service.client;

import com.lms.course_service.config.FeignClientConfig;
import com.lms.course_service.dto.UserResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "USER-SERVICE",
        configuration = FeignClientConfig.class
)
public interface UserServiceClient {

    @GetMapping("/api/users/{userId}")
    UserResponse getUserByUserId(
            @PathVariable("userId") String userId
    );
}