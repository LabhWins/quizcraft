package com.tellmeko.quizapp.dto;

import com.tellmeko.quizapp.entity.Question;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AiGenerationResult {
    private int requested;
    private int duplicatesSkipped;
    private List<Question> questions;
}