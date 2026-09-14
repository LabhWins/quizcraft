package com.tellmeko.quizapp.multiplayer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class MultiplayerSocketController {

    @Autowired
    GameRoomManager gameRoomManager;

    @MessageMapping("/room/{code}/join")
    public void join(@DestinationVariable String code, Map<String, String> payload) {
        gameRoomManager.joinRoom(code, payload.get("nickname"));
    }

    @MessageMapping("/room/{code}/start")
    public void start(@DestinationVariable String code, Map<String, String> payload) {
        gameRoomManager.startGame(code, payload.get("hostToken"));
    }

    @MessageMapping("/room/{code}/answer")
    public void answer(@DestinationVariable String code, Map<String, Object> payload) {
        String nickname = (String) payload.get("nickname");
        int questionIndex = (int) payload.get("questionIndex");
        String selectedOption = (String) payload.get("selectedOption");
        gameRoomManager.submitAnswer(code, nickname, questionIndex, selectedOption);
    }
}