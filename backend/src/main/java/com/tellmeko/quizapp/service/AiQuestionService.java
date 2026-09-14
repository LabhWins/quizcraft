package com.tellmeko.quizapp.service;

import com.tellmeko.quizapp.repository.QuestionRepository;
import com.tellmeko.quizapp.dto.AiGenerationResult;
import org.springframework.beans.factory.annotation.Autowired;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.tellmeko.quizapp.entity.Question;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashSet;

@Service
public class AiQuestionService {

    @Autowired
    QuestionRepository questionRepository;

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    public AiGenerationResult generateQuestions(String topic, String difficulty, int count) {

        // Fetch existing titles to give Gemini context of what already exists
        List<Question> existing = questionRepository.findByCategoryAndDifficultyLevel(
                topic.toLowerCase(), difficulty.toLowerCase());
        Set<String> existingTitles = existing.stream()
                .map(q -> q.getQuestionTitle().trim().toLowerCase())
                .collect(Collectors.toSet());

        // Build hint of existing topics to avoid (up to 20 for prompt brevity)
        String avoidHint = "";
        if (!existing.isEmpty()) {
            String sample = existing.stream()
                    .limit(20)
                    .map(q -> "- " + q.getQuestionTitle())
                    .collect(Collectors.joining("\n"));
            avoidHint = "\n\nDo NOT generate questions similar to or covering the same concept as these already existing ones:\n" + sample;
        }

        String prompt = String.format("""
            Generate exactly %d multiple-choice quiz questions about "%s" at %s difficulty.
            Each question must cover a DIFFERENT sub-topic or concept. Do not repeat question patterns.
            Vary question types across: conceptual understanding, syntax, output prediction, debugging, and best practices.
            Return ONLY a JSON array, no markdown, no explanation. Each object must have exactly these fields:
            category (string, lowercase, use "%s"), difficultyLevel (string, one of easy/medium/hard, use "%s"),
            questionTitle (string), option1, option2, option3, option4 (strings), rightAnswer (string, must exactly match one of the 4 options).%s
            """, count, topic, difficulty, topic.toLowerCase(), difficulty.toLowerCase(), avoidHint);

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of("parts", List.of(Map.of("text", prompt)))),
                "generationConfig", Map.of("responseMimeType", "application/json")
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        JsonNode response = restTemplate.postForObject(GEMINI_URL, entity, JsonNode.class);
        String jsonText = response
                .path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text").asText();

        List<Question> questions = new ArrayList<>();
        try {
            JsonNode arr = mapper.readTree(jsonText);
            for (JsonNode node : arr) {
                Question q = new Question();
                q.setCategory(node.get("category").asText());
                q.setDifficultyLevel(node.get("difficultyLevel").asText());
                q.setQuestionTitle(node.get("questionTitle").asText());
                q.setOption1(node.get("option1").asText());
                q.setOption2(node.get("option2").asText());
                q.setOption3(node.get("option3").asText());
                q.setOption4(node.get("option4").asText());
                q.setRightAnswer(node.get("rightAnswer").asText());
                questions.add(q);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse AI response as question list", e);
        }

        // Step 1: Deduplicate WITHIN the batch itself (Gemini sometimes repeats)
        Set<String> seenInBatch = new HashSet<>();
        List<Question> batchDeduped = new ArrayList<>();
        for (Question q : questions) {
            String normalized = q.getQuestionTitle().trim().toLowerCase();
            if (seenInBatch.add(normalized)) {
                batchDeduped.add(q);
            }
        }

        // Step 2: Deduplicate against existing DB questions
        List<Question> deduped = batchDeduped.stream()
                .filter(q -> !existingTitles.contains(q.getQuestionTitle().trim().toLowerCase()))
                .collect(Collectors.toList());

        int duplicatesSkipped = questions.size() - deduped.size();
        return new AiGenerationResult(count, duplicatesSkipped, deduped);
    }



}