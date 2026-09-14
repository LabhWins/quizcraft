package com.tellmeko.quizapp.repository;

import com.tellmeko.quizapp.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findAllByOrderBySubmittedAtDesc();
    List<QuizAttempt> findByRoomCodeOrderByScoreDesc(String roomCode);
    List<QuizAttempt> findByUsernameOrderBySubmittedAtDesc(String username);
}