package com.lms.quiz_service.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "question_options")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(
        name = "question_option_order_unique",
        def = "{'questionId': 1, 'orderIndex': 1}",
        unique = true
)
public class QuestionOption {

    @Id
    private String id;

    /*
     * Question to which this option belongs.
     */
    private String questionId;

    /*
     * Answer option text.
     *
     * Example:
     * "Java Virtual Machine"
     */
    private String optionText;

    /*
     * Position of the option.
     *
     * Example:
     * 1 → A
     * 2 → B
     * 3 → C
     * 4 → D
     */
    private Integer orderIndex;

    /*
     * Whether this option is the correct answer.
     *
     * This field will be used by the quiz
     * evaluation logic later.
     */
    private Boolean correct;
}
