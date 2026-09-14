package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class QuizResult {
    private Long attemptId;
    private Integer quizId;
    private int score;
    private int total;
    private List<QuestionResult> details;
}