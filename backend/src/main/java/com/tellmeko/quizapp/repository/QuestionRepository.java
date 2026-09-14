package com.tellmeko.quizapp.repository;

import com.tellmeko.quizapp.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByCategory(String category);

    @Query(value = "SELECT * FROM questions q WHERE q.category=:category ORDER BY RANDOM() LIMIT :numQ", nativeQuery = true)
    List<Question> findRandomQuestionsByCategory(
            @Param("category") String category,
            @Param("numQ") int numQ
    );

    @Query(value = "SELECT category, difficulty_level, COUNT(*) as count FROM questions GROUP BY category, difficulty_level ORDER BY category, difficulty_level", nativeQuery = true)
    List<Object[]> getCategoryDifficultySummary();

    @Query(value = "SELECT * FROM questions q WHERE q.category=:category AND q.difficulty_level=:difficulty ORDER BY RANDOM() LIMIT :numQ", nativeQuery = true)
    List<Question> findRandomQuestionsByCategoryAndDifficulty(
            @Param("category") String category,
            @Param("difficulty") String difficulty,
            @Param("numQ") int numQ
    );

    Page<Question> findByCategoryAndDifficultyLevel(String category, String difficultyLevel, Pageable pageable);
    List<Question> findByCategoryAndDifficultyLevel(String category, String difficultyLevel);
    Page<Question> findByCreatedBy(String createdBy, Pageable pageable);
}

