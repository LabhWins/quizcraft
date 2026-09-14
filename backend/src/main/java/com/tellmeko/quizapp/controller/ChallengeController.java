package com.tellmeko.quizapp.controller;

import com.tellmeko.quizapp.dto.ChallengeInfo;
import com.tellmeko.quizapp.dto.ChallengeResultDto;
import com.tellmeko.quizapp.service.ChallengeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("challenge")
public class ChallengeController {

    @Autowired
    ChallengeService challengeService;

    @PostMapping("create")
    public ResponseEntity<ChallengeInfo> createChallenge(@RequestParam Integer quizId, @RequestParam Long attemptId) {
        return challengeService.createChallenge(quizId, attemptId);
    }

    @GetMapping("{token}")
    public ResponseEntity<ChallengeInfo> getChallenge(@PathVariable String token) {
        return challengeService.getChallengeInfo(token);
    }

    @PostMapping("{token}/complete")
    public ResponseEntity<ChallengeResultDto> completeChallenge(@PathVariable String token, @RequestParam Long attemptId) {
        return challengeService.completeChallenge(token, attemptId);
    }

    @GetMapping("{token}/result")
    public ResponseEntity<ChallengeResultDto> getResult(@PathVariable String token) {
        return challengeService.getChallengeResult(token);
    }
}