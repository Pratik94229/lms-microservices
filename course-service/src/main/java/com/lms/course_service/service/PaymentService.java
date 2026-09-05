package com.lms.course_service.service;

import com.lms.course_service.dto.PayPalOrderResponse;
import com.lms.course_service.exception.CourseEnrollmentAccessDeniedException;
import com.lms.course_service.exception.CourseNotFoundException;
import com.lms.course_service.model.Course;
import com.lms.course_service.model.Payment;
import com.lms.course_service.model.PaymentStatus;
import com.lms.course_service.repository.CourseRepository;
import com.lms.course_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final CourseRepository courseRepository;
    private final PaymentRepository paymentRepository;
    private final PayPalService payPalService;
    private final EnrollmentService enrollmentService;

    public PayPalOrderResponse createPayPalOrder(
            String courseId,
            String studentId
    ) {

        Course course =
                courseRepository
                        .findById(courseId)
                        .orElseThrow(() ->
                                new CourseNotFoundException(
                                        "Course not found"
                                )
                        );

        if (!course.isPublished()) {
            throw new CourseEnrollmentAccessDeniedException(
                    "You cannot purchase an unpublished course"
            );
        }

        if (course.getPrice() == null
                || course.getPrice() <= 0) {

            throw new IllegalStateException(
                    "Course price must be greater than zero"
            );
        }

        paymentRepository
                .findFirstByStudentIdAndCourseIdOrderByCreatedAtDesc(
                        studentId,
                        courseId
                )
                .ifPresent(payment -> {

                    if (payment.getStatus()
                            == PaymentStatus.COMPLETED) {

                        throw new IllegalStateException(
                                "You have already purchased this course"
                        );
                    }
                });

        Map<String, Object> paypalOrder =
                payPalService.createOrder(
                        course.getPrice(),
                        courseId
                );

        String orderId =
                (String) paypalOrder.get("orderId");

        String status =
                (String) paypalOrder.get("status");

        String approvalUrl =
                (String) paypalOrder.get("approvalUrl");

        Payment payment =
                Payment.builder()
                        .studentId(studentId)
                        .courseId(courseId)
                        .paypalOrderId(orderId)
                        .paypalCaptureId(null)
                        .amount(course.getPrice())
                        .currency("USD")
                        .status(PaymentStatus.CREATED)
                        .createdAt(LocalDateTime.now())
                        .completedAt(null)
                        .build();

        paymentRepository.save(payment);

        return new PayPalOrderResponse(
                orderId,
                status,
                approvalUrl
        );
    }

    public Payment capturePayPalOrder(
            String orderId,
            String studentId
    ) {

        Payment payment =
                paymentRepository
                        .findByPaypalOrderId(orderId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "Payment not found for PayPal order"
                                )
                        );

        if (!payment.getStudentId().equals(studentId)) {
            throw new CourseEnrollmentAccessDeniedException(
                    "You are not authorized to capture this payment"
            );
        }

        /*
         * If this payment was already completed,
         * return it without calling PayPal again.
         */
        if (payment.getStatus()
                == PaymentStatus.COMPLETED) {

            return payment;
        }

        /*
         * Capture the PayPal order.
         */
        Map<String, Object> captureResponse =
                payPalService.captureOrder(orderId);

        String paypalStatus =
                (String) captureResponse.get("status");

        String captureId =
                (String) captureResponse.get("captureId");

        /*
         * PayPal must report COMPLETED.
         */
        if (!"COMPLETED".equalsIgnoreCase(paypalStatus)) {

            payment.setStatus(PaymentStatus.FAILED);

            paymentRepository.save(payment);

            throw new IllegalStateException(
                    "PayPal payment was not completed"
            );
        }

        /*
         * Mark payment as completed.
         */
        payment.setPaypalCaptureId(captureId);
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());

        Payment completedPayment =
                paymentRepository.save(payment);

        /*
         * Payment succeeded.
         *
         * Now create the LMS enrollment.
         *
         * The enrollment service also prevents
         * duplicate enrollment.
         */
        try {

            enrollmentService.enrollStudent(
                    payment.getCourseId(),
                    studentId
            );

        } catch (Exception ex) {

            /*
             * Important:
             *
             * The PayPal payment is already completed.
             * We therefore do NOT mark the payment FAILED.
             *
             * We propagate the error so that we can see
             * the enrollment problem and fix it properly.
             */
            throw new IllegalStateException(
                    "Payment completed, but course enrollment failed",
                    ex
            );
        }

        return completedPayment;
    }
}