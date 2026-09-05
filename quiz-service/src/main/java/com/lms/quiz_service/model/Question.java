package com.lms.quiz_service.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(
        name = "quiz_question_order_unique",
        def = "{'quizId': 1, 'orderIndex': 1}",
        unique = true
)
public class Question {

    @Id
    private String id;

    /*
     * Quiz to which this question belongs.
     */
    private String quizId;

    /*
     * The actual question text.
     */
    private String questionText;

    /*
     * Question type.
     *
     * For the first version we'll support:
     *
     * MCQ_SINGLE
     */
    private QuestionType type;

    /*
     * Position of the question inside the quiz.
     *
     * Example:
     *
     * 1 → What is JVM?
     * 2 → What is JDK?
     * 3 → What is JRE?
     */
    private Integer orderIndex;

    /*
     * Marks awarded for a correct answer.
     */
    private Integer marks;
}
