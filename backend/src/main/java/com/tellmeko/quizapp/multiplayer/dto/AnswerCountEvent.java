
package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnswerCountEvent {
    private String type = "ANSWER_COUNT";
    private int answered;
    private int total;

    public AnswerCountEvent(int answered, int total) {
        this.answered = answered;
        this.total = total;
    }
}