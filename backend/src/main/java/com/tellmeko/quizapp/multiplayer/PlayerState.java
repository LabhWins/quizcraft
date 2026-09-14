package com.tellmeko.quizapp.multiplayer;

import lombok.Data;
import java.util.HashMap;
import java.util.Map;

@Data
public class PlayerState {
    private String nickname;
    private int score = 0;
    private Map<Integer, String> answersGiven = new HashMap<>();

    public PlayerState(String nickname) {
        this.nickname = nickname;
    }
}