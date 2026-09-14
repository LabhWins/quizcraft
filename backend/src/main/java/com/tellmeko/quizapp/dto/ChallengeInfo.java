package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChallengeInfo {
    private String token;
    private Integer quizId;
    private String quizTitle;
    private String category;
    private String difficultyLevel;
    private String creatorName;
    private String status;
}