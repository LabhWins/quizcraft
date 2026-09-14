package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntry {
    private String nickname;
    private int score;
}