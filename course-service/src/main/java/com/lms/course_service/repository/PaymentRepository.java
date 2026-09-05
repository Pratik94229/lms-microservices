package com.lms.course_service.repository;

import com.lms.course_service.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PaymentRepository
        extends MongoRepository<Payment, String> {

    Optional<Payment> findByPaypalOrderId(
            String paypalOrderId
    );

    boolean existsByPaypalOrderId(
            String paypalOrderId
    );

    Optional<Payment> findFirstByStudentIdAndCourseIdOrderByCreatedAtDesc(
            String studentId,
            String courseId
    );
}