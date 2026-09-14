package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class AttemptSummary {
    private Long id;
    private String quizTitle;
    private String playerName;
    private String category;
    private String difficultyLevel;
    private int score;
    private int total;
    private LocalDateTime submittedAt;
}