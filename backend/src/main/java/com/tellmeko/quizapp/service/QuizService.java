package com.tellmeko.quizapp.service;

import com.tellmeko.quizapp.dto.*;
import com.tellmeko.quizapp.repository.QuestionRepository;
import com.tellmeko.quizapp.repository.QuizAttemptRepository;
import com.tellmeko.quizapp.repository.QuizRepository;
import com.tellmeko.quizapp.entity.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuizService {

    @Autowired
    QuizRepository quizRepository;
    @Autowired
    QuestionRepository questionRepository;
    @Autowired
    QuizAttemptRepository quizAttemptRepository;

    public ResponseEntity<Integer> createQuiz(String category, String difficulty, int numQ, String title) {
        List<Question> questions = questionRepository.findRandomQuestionsByCategoryAndDifficulty(category, difficulty, numQ);
        if (questions.size() < numQ) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Quiz quiz = new Quiz();
        quiz.setTitle(title);
        quiz.setQuestions(questions);
        Quiz saved = quizRepository.save(quiz);
        return new ResponseEntity<>(saved.getId(), HttpStatus.CREATED);
    }

    public ResponseEntity<List<QuestionWrapper>> getQuizQuestion(Integer id) {
        Quiz quiz = quizRepository.findById(id).orElseThrow();
        List<Question> questionsFromDB = quiz.getQuestions();
        List<QuestionWrapper> questionForUser = new ArrayList<>();
        for (Question q : questionsFromDB) {
            QuestionWrapper qw = new QuestionWrapper(q.getPk(), q.getQuestionTitle(), q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4());
            questionForUser.add(qw);
        }
        return new ResponseEntity<>(questionForUser, HttpStatus.OK);
    }

    public ResponseEntity<QuizResult> calculateResult(Integer id, QuizSubmission submission, String username) {
        Quiz quiz = quizRepository.findById(id).orElseThrow();
        List<Question> questions = quiz.getQuestions();

        Map<Long, String> responseMap = new HashMap<>();
        for (Response r : submission.getResponses()) {
            responseMap.put(r.getPk(), r.getResponse());
        }

        int right = 0;
        List<QuestionResult> details = new ArrayList<>();

        for (Question q : questions) {
            String selected = responseMap.getOrDefault(q.getPk(), "");
            boolean isCorrect = q.getRightAnswer().equals(selected);
            if (isCorrect) right++;
            details.add(new QuestionResult(q.getPk(), q.getQuestionTitle(), selected, q.getRightAnswer(), isCorrect));
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(id);
        attempt.setQuizTitle(quiz.getTitle());
        attempt.setPlayerName(submission.getPlayerName());
        attempt.setPlayerEmail(submission.getPlayerEmail());
        attempt.setCategory(questions.isEmpty() ? "unknown" : questions.get(0).getCategory());
        attempt.setDifficultyLevel(questions.isEmpty() ? "unknown" : questions.get(0).getDifficultyLevel());
        attempt.setScore(right);
        attempt.setTotal(questions.size());
        attempt.setSubmittedAt(LocalDateTime.now());
        attempt.setDetailsJson(mapper.writeValueAsString(details));
        attempt.setUsername(username);
        QuizAttempt saved = quizAttemptRepository.save(attempt);

        QuizResult result = new QuizResult(saved.getId(), id, right, questions.size(), details);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    public ResponseEntity<List<AttemptSummary>> getHistory() {
        List<AttemptSummary> summaries = quizAttemptRepository.findAllByOrderBySubmittedAtDesc().stream()
                .map(a -> new AttemptSummary(a.getId(), a.getQuizTitle(), a.getPlayerName(), a.getCategory(), a.getDifficultyLevel(), a.getScore(), a.getTotal(), a.getSubmittedAt()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(summaries, HttpStatus.OK);
    }

    public ResponseEntity<QuizResult> getAttemptById(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId).orElseThrow();
        List<QuestionResult> details;
        try {
            details = mapper.readValue(attempt.getDetailsJson(), mapper.getTypeFactory().constructCollectionType(List.class, QuestionResult.class));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse stored attempt details", e);
        }
        QuizResult result = new QuizResult(attempt.getId(), attempt.getQuizId(), attempt.getScore(), attempt.getTotal(), details);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    private final ObjectMapper mapper = new ObjectMapper();

    // 👇 ADD THIS METHOD:
    public ResponseEntity<List<AttemptSummary>> getMyHistory(String username) {
        List<AttemptSummary> summaries = quizAttemptRepository.findByUsernameOrderBySubmittedAtDesc(username).stream()
                .map(a -> new AttemptSummary(
                        a.getId(),
                        a.getQuizTitle(),
                        a.getPlayerName(),
                        a.getCategory(),
                        a.getDifficultyLevel(),
                        a.getScore(),
                        a.getTotal(),
                        a.getSubmittedAt()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(summaries, HttpStatus.OK);
    }

}
