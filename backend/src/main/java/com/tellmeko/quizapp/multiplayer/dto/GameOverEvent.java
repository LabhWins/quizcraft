package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class GameOverEvent {
    private String type = "GAME_OVER";
    private List<LeaderboardEntry> finalLeaderboard;

    public GameOverEvent(List<LeaderboardEntry> finalLeaderboard) {
        this.finalLeaderboard = finalLeaderboard;
    }
}