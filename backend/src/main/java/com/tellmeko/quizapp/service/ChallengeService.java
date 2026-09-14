package com.tellmeko.quizapp.service;

import com.tellmeko.quizapp.dto.ChallengeInfo;
import com.tellmeko.quizapp.dto.ChallengeResultDto;
import com.tellmeko.quizapp.repository.ChallengeRepository;
import com.tellmeko.quizapp.repository.QuizAttemptRepository;
import com.tellmeko.quizapp.repository.QuizRepository;
import com.tellmeko.quizapp.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class ChallengeService {

    @Autowired
    ChallengeRepository challengeRepository;

    @Autowired
    QuizAttemptRepository quizAttemptRepository;

    @Autowired
    QuizRepository quizRepository;

    public ResponseEntity<ChallengeInfo> createChallenge(Integer quizId, Long creatorAttemptId) {
        Challenge challenge = new Challenge();
        challenge.setQuizId(quizId);
        challenge.setCreatorAttemptId(creatorAttemptId);
        challenge.setToken(UUID.randomUUID().toString().substring(0, 8));
        challenge.setStatus("PENDING");
        challenge.setCreatedAt(LocalDateTime.now());
        Challenge saved = challengeRepository.save(challenge);

        return buildChallengeInfo(saved);
    }

    public ResponseEntity<ChallengeInfo> getChallengeInfo(String token) {
        Challenge challenge = challengeRepository.findByToken(token).orElseThrow();
        return buildChallengeInfo(challenge);
    }

    private ResponseEntity<ChallengeInfo> buildChallengeInfo(Challenge challenge) {
        Quiz quiz = quizRepository.findById(challenge.getQuizId()).orElseThrow();
        QuizAttempt creatorAttempt = quizAttemptRepository.findById(challenge.getCreatorAttemptId()).orElseThrow();

        String category = quiz.getQuestions().isEmpty() ? "unknown" : quiz.getQuestions().get(0).getCategory();
        String difficulty = quiz.getQuestions().isEmpty() ? "unknown" : quiz.getQuestions().get(0).getDifficultyLevel();

        ChallengeInfo info = new ChallengeInfo(
                challenge.getToken(),
                quiz.getId(),
                quiz.getTitle(),
                category,
                difficulty,
                creatorAttempt.getPlayerName(),
                challenge.getStatus()
        );
        return new ResponseEntity<>(info, HttpStatus.OK);
    }

    public ResponseEntity<ChallengeResultDto> completeChallenge(String token, Long opponentAttemptId) {
        Challenge challenge = challengeRepository.findByToken(token).orElseThrow();
        challenge.setOpponentAttemptId(opponentAttemptId);
        challenge.setStatus("COMPLETED");
        challengeRepository.save(challenge);

        return getChallengeResult(token);
    }

    public ResponseEntity<ChallengeResultDto> getChallengeResult(String token) {
        Challenge challenge = challengeRepository.findByToken(token).orElseThrow();
        Quiz quiz = quizRepository.findById(challenge.getQuizId()).orElseThrow();
        QuizAttempt creatorAttempt = quizAttemptRepository.findById(challenge.getCreatorAttemptId()).orElseThrow();
        QuizAttempt opponentAttempt = quizAttemptRepository.findById(challenge.getOpponentAttemptId()).orElseThrow();

        String winner;
        if (creatorAttempt.getScore() > opponentAttempt.getScore()) {
            winner = "creator";
        } else if (opponentAttempt.getScore() > creatorAttempt.getScore()) {
            winner = "opponent";
        } else {
            winner = "tie";
        }

        ChallengeResultDto dto = new ChallengeResultDto(
                quiz.getTitle(),
                creatorAttempt.getPlayerName(),
                creatorAttempt.getScore(),
                creatorAttempt.getTotal(),
                opponentAttempt.getPlayerName(),
                opponentAttempt.getScore(),
                opponentAttempt.getTotal(),
                winner
        );
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }
}