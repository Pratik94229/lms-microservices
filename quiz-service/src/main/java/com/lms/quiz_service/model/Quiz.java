package com.lms.quiz_service.model;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "quizzes")
@CompoundIndex(
        name = "section_title_unique",
        def = "{'sectionId': 1, 'title': 1}",
        unique = true
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quiz {

    @Id
    private String id;

    private String sectionId;

    private String title;

    private String description;

    /*
     * Minimum percentage required to pass.
     *
     * Example:
     * passingScore = 60
     *
     * Student needs at least 60%.
     */
    private Integer passingScore;

    /*
     * Maximum time allowed for the quiz.
     *
     * Stored in minutes.
     *
     * null means there is no time limit.
     */
    private Integer timeLimit;
}
