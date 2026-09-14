package com.tellmeko.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CategorySummary {
    private String category;
    private String difficultyLevel;
    private long count;
}