package com.lms.quiz_service.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "quiz_attempt_answers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(
        name = "attempt_question_unique",
        def = "{'attemptId': 1, 'questionId': 1}",
        unique = true
)
public class QuizAttemptAnswer {

    @Id
    private String id;

    /*
     * Quiz attempt to which this answer belongs.
     */
    private String attemptId;

    /*
     * Question being answered.
     */
    private String questionId;

    /*
     * Selected option.
     */
    private String selectedOptionId;
}