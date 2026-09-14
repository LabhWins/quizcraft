package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class QuestionEndedEvent {
    private String type = "QUESTION_ENDED";
    private String correctAnswer;
    private List<LeaderboardEntry> leaderboard;

    public QuestionEndedEvent(String correctAnswer, List<LeaderboardEntry> leaderboard) {
        this.correctAnswer = correctAnswer;
        this.leaderboard = leaderboard;
    }
}