package com.tellmeko.quizapp.dto;

import lombok.Data;

@Data
public class QuestionWrapper {

    private Long pk;
    private String questionTitle;
    private String option1;
    private String option2;
    private String option3;
    private String option4;

    public QuestionWrapper(Long pk, String questionTitle, String option1, String option2, String option3, String option4) {
        this.pk = pk;
        this.questionTitle = questionTitle;
        this.option1 = option1;
        this.option2 = option2;
        this.option3 = option3;
        this.option4 = option4;
    }
}
