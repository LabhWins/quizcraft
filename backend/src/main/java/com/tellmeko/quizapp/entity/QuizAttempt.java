package com.tellmeko.quizapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quizId;
    private String quizTitle;
    private String category;
    private String difficultyLevel;
    private String playerName;
    private String playerEmail;
    private int score;
    private int total;
    private LocalDateTime submittedAt;

    @Column(columnDefinition = "TEXT")
    private String detailsJson;

    private String roomCode;

    private String username;
}
