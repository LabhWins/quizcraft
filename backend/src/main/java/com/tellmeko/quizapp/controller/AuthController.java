package com.tellmeko.quizapp.controller;

import com.tellmeko.quizapp.repository.UserRepository;
import com.tellmeko.quizapp.dto.AuthRequest;
import com.tellmeko.quizapp.dto.AuthResponse;
import com.tellmeko.quizapp.entity.User;
import com.tellmeko.quizapp.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already taken");
        }
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER"); // default role; promote to ADMIN manually in DB if needed
        userRepository.save(user);
        return new ResponseEntity<>("Registered successfully", HttpStatus.CREATED);
    }

    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
        return new ResponseEntity<>(new AuthResponse(token, user.getUsername(), user.getRole()), HttpStatus.OK);
    }
}