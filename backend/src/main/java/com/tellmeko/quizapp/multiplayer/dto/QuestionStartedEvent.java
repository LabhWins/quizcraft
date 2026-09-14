package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestionStartedEvent {
    private String type = "QUESTION_STARTED";
    private int questionIndex;
    private int totalQuestions;
    private String questionTitle;
    private String option1, option2, option3, option4;
    private long durationMs;

    public QuestionStartedEvent(int questionIndex, int totalQuestions, String questionTitle,
                                String option1, String option2, String option3, String option4, long durationMs) {
        this.questionIndex = questionIndex;
        this.totalQuestions = totalQuestions;
        this.questionTitle = questionTitle;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
        this.durationMs = durationMs;
    }
}