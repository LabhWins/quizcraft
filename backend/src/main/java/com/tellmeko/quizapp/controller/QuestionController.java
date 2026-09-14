package com.tellmeko.quizapp.controller;

import com.tellmeko.quizapp.repository.AuditLogRepository;
import com.tellmeko.quizapp.dto.AiGenerationResult;
import com.tellmeko.quizapp.entity.AuditLog;
import com.tellmeko.quizapp.dto.CategorySummary;
import com.tellmeko.quizapp.entity.Question;
import com.tellmeko.quizapp.service.QuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.tellmeko.quizapp.service.AiQuestionService;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("question")
public class QuestionController {

    @Autowired
    QuestionService questionService;
    @Autowired
    AiQuestionService aiQuestionService;
    @Autowired
    AuditLogRepository auditLogRepository;

    @GetMapping("allQuestions")
    public ResponseEntity<List<Question>> getAllQuestions(){
        return questionService.getAllQuestions();
    }

    @GetMapping("Category/{category}")
    public ResponseEntity<List<Question>> getQuestionByCategory (@PathVariable String category){
        return questionService.getQuestionsByCategory(category);
    }

    @PostMapping("add")
    public ResponseEntity<String> AddQuestion(@Valid @RequestBody Question question, Authentication authentication){
        return questionService.addQuestion(question, authentication.getName());
    }

    @PutMapping("update/{id}")
    public ResponseEntity<String> UpdateQuestion(
            @PathVariable long id,
            @Valid @RequestBody Question question,
            Authentication authentication){
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return questionService.updateQuestion(id, question, authentication.getName(), isAdmin);
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<String> DeleteQuestion(@PathVariable Integer id, Authentication authentication){
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return questionService.DeleteQuestion(id, authentication.getName(), isAdmin);
    }

    @GetMapping("categorySummary")
    public ResponseEntity<List<CategorySummary>> getCategorySummary(){
        return questionService.getCategorySummary();
    }

    @GetMapping("generate")
    public ResponseEntity<AiGenerationResult> generateQuestions(
            @RequestParam String topic,
            @RequestParam String difficulty,
            @RequestParam(defaultValue = "5") int count) {
        return new ResponseEntity<>(aiQuestionService.generateQuestions(topic, difficulty, count), HttpStatus.OK);
    }

    @GetMapping("paged")
    public ResponseEntity<Page<Question>> getPagedQuestions(
            @RequestParam String category,
            @RequestParam String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return questionService.getQuestionsByCategoryAndDifficulty(category, difficulty, page, size);
    }

    @GetMapping("auditlog")
    public ResponseEntity<List<AuditLog>> getAuditLog() {
        return new ResponseEntity<>(auditLogRepository.findAllByOrderByTimestampDesc(), HttpStatus.OK);
    }

    @GetMapping("my")
    public ResponseEntity<Page<Question>> getMyQuestions(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return questionService.getMyQuestions(authentication.getName(), page, size);
    }

}
