package com.tellmeko.quizapp.multiplayer;

import com.tellmeko.quizapp.entity.Question;
import lombok.Data;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Data
public class GameRoom {
    private String roomCode;
    private String hostToken;
    private String hostName;
    private Integer quizId;
    private String quizTitle;
    private String category;
    private String difficultyLevel;
    private List<Question> questions;
    private int currentIndex = -1;
    private RoomStatus status = RoomStatus.WAITING;
    private long currentQuestionStartMillis;
    private ScheduledFuture<?> currentTimerFuture;
    private final ConcurrentHashMap<String, PlayerState> players = new ConcurrentHashMap<>();

    public static final long QUESTION_DURATION_MS = 15000;
    public static final long RESULTS_PAUSE_MS = 4000;
}