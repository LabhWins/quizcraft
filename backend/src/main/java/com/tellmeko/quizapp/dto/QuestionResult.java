package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class QuestionResult {
    private Long pk;
    private String questionTitle;
    private String selectedAnswer;
    private String correctAnswer;
    private boolean correct;
}