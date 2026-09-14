package com.tellmeko.quizapp.config;

import com.tellmeko.quizapp.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {})
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/question/categorySummary").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quiz/create").permitAll()
                        .requestMatchers(HttpMethod.GET, "/quiz/get/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/quiz/submit/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/quiz/my-history").authenticated()
                        .requestMatchers(HttpMethod.GET, "/quiz/history").permitAll()
                        .requestMatchers(HttpMethod.GET, "/quiz/attempt/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/challenge/create").authenticated()
                        .requestMatchers(HttpMethod.GET, "/challenge/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/challenge/*/complete").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/multiplayer/create").authenticated()
                        .requestMatchers(HttpMethod.GET, "/multiplayer/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/multiplayer/*/results").permitAll()
                        .requestMatchers(HttpMethod.POST, "/question/add").authenticated()
                        .requestMatchers(HttpMethod.GET, "/question/generate").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/question/update/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/question/delete/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/question/my").authenticated()
                        .anyRequest().hasRole("ADMIN")
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}