package com.tellmeko.quizapp.controller;

import com.tellmeko.quizapp.dto.AttemptSummary;
import com.tellmeko.quizapp.dto.QuestionWrapper;
import com.tellmeko.quizapp.dto.QuizResult;
import com.tellmeko.quizapp.dto.QuizSubmission;
import com.tellmeko.quizapp.repository.QuizAttemptRepository;
import com.tellmeko.quizapp.service.QuizService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

import java.util.List;

@RestController
@RequestMapping("quiz")
public class QuizController {

    @Autowired
    QuizService quizService;
    @Autowired
    QuizAttemptRepository quizAttemptRepository;

    @PostMapping("create")
    public ResponseEntity<Integer> createQuiz(
            @RequestParam String category,
            @RequestParam String difficulty,
            @RequestParam int numQ,
            @RequestParam String title){
        return quizService.createQuiz(category, difficulty, numQ, title);
    }

    @GetMapping("get/{id}")
    public ResponseEntity <List<QuestionWrapper>> getQuizQuestions(@PathVariable Integer id){
        return quizService.getQuizQuestion(id);
    }

    @PostMapping("submit/{id}")
    public ResponseEntity<QuizResult> submitQuiz(
            @PathVariable Integer id,
            @RequestBody QuizSubmission submission,
            Principal principal){
        String username = (principal != null) ? principal.getName() : null;
        return quizService.calculateResult(id, submission, username);
    }

    @GetMapping("my-history")
    public ResponseEntity<List<AttemptSummary>> getMyHistory(Principal principal) {
        if (principal == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        return quizService.getMyHistory(principal.getName());
    }

    @GetMapping("history")
    public ResponseEntity<List<AttemptSummary>> getHistory() {
        return quizService.getHistory();
    }

    @GetMapping("attempt/{attemptId}")
    public ResponseEntity<QuizResult> getAttempt(@PathVariable Long attemptId) {
        return quizService.getAttemptById(attemptId);
    }
}
