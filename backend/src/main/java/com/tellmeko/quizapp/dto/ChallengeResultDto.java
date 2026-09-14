package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChallengeResultDto {
    private String quizTitle;
    private String creatorName;
    private int creatorScore;
    private int creatorTotal;
    private String opponentName;
    private int opponentScore;
    private int opponentTotal;
    private String winner; // "creator", "opponent", or "tie"
}