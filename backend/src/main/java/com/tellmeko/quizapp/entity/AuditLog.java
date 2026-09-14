package com.tellmeko.quizapp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action; // "ADD", "UPDATE", "DELETE"
    private String username;
    private Long questionId;
    private String questionTitle;
    private LocalDateTime timestamp;
}