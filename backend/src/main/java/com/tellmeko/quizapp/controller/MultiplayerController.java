package com.tellmeko.quizapp.controller;

import com.tellmeko.quizapp.repository.QuestionRepository;
import com.tellmeko.quizapp.repository.QuizAttemptRepository;
import com.tellmeko.quizapp.entity.Question;
import com.tellmeko.quizapp.entity.QuizAttempt;
import com.tellmeko.quizapp.multiplayer.GameRoom;
import com.tellmeko.quizapp.multiplayer.GameRoomManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("multiplayer")
public class MultiplayerController {

    @Autowired
    GameRoomManager gameRoomManager;

    @Autowired
    QuestionRepository questionRepository;

    @Autowired
    QuizAttemptRepository quizAttemptRepository;


    @PostMapping("create")
    public ResponseEntity<?> createRoom(
            @RequestParam String category,
            @RequestParam String difficulty,
            @RequestParam int numQ,
            @RequestParam String hostName) {

        List<Question> questions = questionRepository.findByCategoryAndDifficultyLevel(category, difficulty);
        if (questions.size() < numQ) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Not enough questions available");
        }
        List<Question> selected = questions.subList(0, numQ);

        GameRoom room = gameRoomManager.createRoom(null, category + " " + difficulty + " Quiz", selected, hostName);

        return ResponseEntity.ok(Map.of(
                "roomCode", room.getRoomCode(),
                "hostToken", room.getHostToken()
        ));
    }

    @GetMapping("{code}")
    public ResponseEntity<?> getRoomInfo(@PathVariable String code) {
        GameRoom room = gameRoomManager.getRoom(code);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }
        return ResponseEntity.ok(Map.of(
                "roomCode", room.getRoomCode(),
                "quizTitle", room.getQuizTitle(),
                "hostName", room.getHostName(),
                "status", room.getStatus().name(),
                "playerCount", room.getPlayers().size()
        ));
    }

    @GetMapping("{code}/results")
    public ResponseEntity<?> getResults(@PathVariable String code) {
        List<QuizAttempt> attempts = quizAttemptRepository.findByRoomCodeOrderByScoreDesc(code);
        List<Map<String, Object>> leaderboard = attempts.stream()
                .map(a -> Map.<String, Object>of("nickname", a.getPlayerName(), "score", a.getScore(), "total", a.getTotal()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("quizTitle", attempts.isEmpty() ? "" : attempts.get(0).getQuizTitle(), "leaderboard", leaderboard));
    }
}