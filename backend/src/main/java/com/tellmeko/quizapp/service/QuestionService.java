package com.tellmeko.quizapp.service;

import com.tellmeko.quizapp.repository.AuditLogRepository;
import com.tellmeko.quizapp.repository.QuestionRepository;
import com.tellmeko.quizapp.entity.AuditLog;
import com.tellmeko.quizapp.entity.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.tellmeko.quizapp.dto.CategorySummary;

import java.time.LocalDateTime;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@Service
public class QuestionService {

    @Autowired
    QuestionRepository questionRepository;
    @Autowired
    AuditLogRepository auditLogRepository;

    private static final Logger logger = LoggerFactory.getLogger(QuestionService.class);

    public ResponseEntity<List<Question>> getAllQuestions() {
        try {
            return new ResponseEntity<>(questionRepository.findAll(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Failed to fetch all questions", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<List<Question>> getQuestionsByCategory(String category) {
        try {
            return new ResponseEntity<>(questionRepository.findByCategory(category), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Failed to fetch questions by category", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public ResponseEntity<String> addQuestion(Question question, String username) {
        try {
            question.setCreatedBy(username);
            questionRepository.save(question);
            logAction("ADD", username, question.getPk(), question.getQuestionTitle());
            return new ResponseEntity<>("success", HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Failed to add question", e);
        }
        return new ResponseEntity<>("failed", HttpStatus.BAD_REQUEST);
    }

    public ResponseEntity<String> updateQuestion(long id, Question question, String username, boolean isAdmin) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing == null) {
            return new ResponseEntity<>("Question with ID " + id + " not found", HttpStatus.BAD_REQUEST);
        }
        if (!isAdmin && !username.equals(existing.getCreatedBy())) {
            return new ResponseEntity<>("You can only edit questions you added", HttpStatus.FORBIDDEN);
        }
        question.setPk(id);
        question.setCreatedBy(existing.getCreatedBy());
        questionRepository.save(question);
        logAction("UPDATE", username, id, question.getQuestionTitle());
        return new ResponseEntity<>("Question updated successfully", HttpStatus.ACCEPTED);
    }

    public ResponseEntity<String> DeleteQuestion(long id, String username, boolean isAdmin) {
        Question existing = questionRepository.findById(id).orElse(null);
        if (existing == null) {
            return new ResponseEntity<>("Question with ID " + id + " not found", HttpStatus.BAD_REQUEST);
        }
        if (!isAdmin && !username.equals(existing.getCreatedBy())) {
            return new ResponseEntity<>("You can only delete questions you added", HttpStatus.FORBIDDEN);
        }
        logAction("DELETE", username, id, existing.getQuestionTitle());
        questionRepository.deleteById(id);
        return new ResponseEntity<>("Question deleted successfully", HttpStatus.ACCEPTED);
    }

    public ResponseEntity<List<CategorySummary>> getCategorySummary() {
        List<CategorySummary> summary = questionRepository.getCategoryDifficultySummary().stream()
                .map(row -> new CategorySummary((String) row[0], (String) row[1], ((Number) row[2]).longValue()))
                .collect(Collectors.toList());
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }

    public ResponseEntity<Page<Question>> getQuestionsByCategoryAndDifficulty(String category, String difficulty, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("pk").ascending());
        Page<Question> result = questionRepository.findByCategoryAndDifficultyLevel(category, difficulty, pageable);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    private void logAction(String action, String username, Long questionId, String title) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setUsername(username);
        log.setQuestionId(questionId);
        log.setQuestionTitle(title);
        log.setTimestamp(LocalDateTime.now());
        auditLogRepository.save(log);
    }

    public ResponseEntity<Page<Question>> getMyQuestions(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("pk").descending());
        return new ResponseEntity<>(questionRepository.findByCreatedBy(username, pageable), HttpStatus.OK);
    }
}
