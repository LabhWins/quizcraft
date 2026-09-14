package com.tellmeko.quizapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Challenge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer quizId;
    private Long creatorAttemptId;
    private Long opponentAttemptId; // null until accepted
    private String token;
    private String status; // "PENDING" or "COMPLETED"
    private LocalDateTime createdAt;
}