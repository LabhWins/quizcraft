
package com.tellmeko.quizapp.multiplayer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class PlayerJoinedEvent {
    private String type = "PLAYER_JOINED";
    private List<String> players;

    public PlayerJoinedEvent(List<String> players) {
        this.players = players;
    }
}