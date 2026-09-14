package com.tellmeko.quizapp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pk;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Difficulty level is required")
    @Column(name = "difficulty_level")
    private String difficultyLevel;

    @NotBlank(message = "Question title is required")
    @Size(max = 500, message = "Question title too long")
    @Column(name = "question_title")
    private String questionTitle;

    @NotBlank(message = "Option 1 is required")
    private String option1;
    @NotBlank(message = "Option 2 is required")
    private String option2;
    @NotBlank(message = "Option 3 is required")
    private String option3;
    @NotBlank(message = "Option 4 is required")
    private String option4;

    @NotBlank(message = "Right answer is required")
    @Column(name = "right_answer")
    private String rightAnswer;

    @Column(name = "created_by")
    private String createdBy;
}
