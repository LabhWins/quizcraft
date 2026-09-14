package com.tellmeko.quizapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class QuizSubmission {
    private String playerName;
    private String playerEmail;
    private List<Response> responses;
}