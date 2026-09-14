package com.tellmeko.quizapp.multiplayer;

import com.tellmeko.quizapp.repository.QuizAttemptRepository;
import com.tellmeko.quizapp.entity.Question;
import com.tellmeko.quizapp.dto.QuestionResult;
import com.tellmeko.quizapp.entity.QuizAttempt;
import com.tellmeko.quizapp.multiplayer.dto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GameRoomManager {

    private final Map<String, GameRoom> rooms = new ConcurrentHashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    @Qualifier("gameTimerScheduler")
    private ThreadPoolTaskScheduler scheduler;

    @Autowired
    private QuizAttemptRepository quizAttemptRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    public GameRoom createRoom(Integer quizId, String quizTitle, List<Question> questions, String hostName) {
        String code = generateRoomCode();
        GameRoom room = new GameRoom();
        room.setRoomCode(code);
        room.setHostToken(UUID.randomUUID().toString());
        room.setHostName(hostName);
        room.setQuizId(quizId);
        room.setQuizTitle(quizTitle);
        room.setQuestions(questions);
        room.setCategory(questions.isEmpty() ? "unknown" : questions.get(0).getCategory());
        room.setDifficultyLevel(questions.isEmpty() ? "unknown" : questions.get(0).getDifficultyLevel());
        rooms.put(code, room);
        return room;
    }

    public GameRoom getRoom(String code) {
        return rooms.get(code);
    }

    public synchronized void joinRoom(String code, String nickname) {
        GameRoom room = rooms.get(code);
        if (room == null || room.getStatus() != RoomStatus.WAITING) return;
        room.getPlayers().putIfAbsent(nickname, new PlayerState(nickname));
        broadcastPlayers(room);
    }

    public synchronized void startGame(String code, String hostToken) {
        GameRoom room = rooms.get(code);
        if (room == null || !room.getHostToken().equals(hostToken)) return;
        if (room.getStatus() != RoomStatus.WAITING) return;
        room.setStatus(RoomStatus.IN_PROGRESS);
        advanceQuestion(room);
    }

    private void advanceQuestion(GameRoom room) {
        room.setCurrentIndex(room.getCurrentIndex() + 1);
        if (room.getCurrentIndex() >= room.getQuestions().size()) {
            endGame(room);
            return;
        }
        Question q = room.getQuestions().get(room.getCurrentIndex());
        room.setCurrentQuestionStartMillis(System.currentTimeMillis());

        QuestionStartedEvent event = new QuestionStartedEvent(
                room.getCurrentIndex(), room.getQuestions().size(), q.getQuestionTitle(),
                q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4(),
                GameRoom.QUESTION_DURATION_MS
        );
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), event);

        room.setCurrentTimerFuture(scheduler.schedule(
                () -> endQuestion(room),
                Instant.now().plusMillis(GameRoom.QUESTION_DURATION_MS)
        ));
    }

    public synchronized void submitAnswer(String code, String nickname, int questionIndex, String selectedOption) {
        GameRoom room = rooms.get(code);
        if (room == null || room.getStatus() != RoomStatus.IN_PROGRESS) return;
        if (questionIndex != room.getCurrentIndex()) return;

        PlayerState player = room.getPlayers().get(nickname);
        if (player == null || player.getAnswersGiven().containsKey(questionIndex)) return;

        player.getAnswersGiven().put(questionIndex, selectedOption);

        Question q = room.getQuestions().get(questionIndex);
        if (q.getRightAnswer().equals(selectedOption)) {
            long elapsed = System.currentTimeMillis() - room.getCurrentQuestionStartMillis();
            double fractionRemaining = Math.max(0, 1.0 - ((double) elapsed / GameRoom.QUESTION_DURATION_MS));
            int points = (int) Math.round(500 + 500 * fractionRemaining);
            player.setScore(player.getScore() + points);
        }

        long answeredCount = room.getPlayers().values().stream()
                .filter(p -> p.getAnswersGiven().containsKey(questionIndex))
                .count();
        messagingTemplate.convertAndSend("/topic/room/" + code,
                new AnswerCountEvent((int) answeredCount, room.getPlayers().size()));

        if (answeredCount == room.getPlayers().size() && !room.getPlayers().isEmpty()) {
            if (room.getCurrentTimerFuture() != null) {
                room.getCurrentTimerFuture().cancel(false);
            }
            endQuestion(room);
        }
    }

    private synchronized void endQuestion(GameRoom room) {
        if (room.getStatus() != RoomStatus.IN_PROGRESS) return;
        int idx = room.getCurrentIndex();
        Question q = room.getQuestions().get(idx);

        List<LeaderboardEntry> leaderboard = buildLeaderboard(room);
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(),
                new QuestionEndedEvent(q.getRightAnswer(), leaderboard));

        scheduler.schedule(() -> advanceQuestion(room),
                Instant.now().plusMillis(GameRoom.RESULTS_PAUSE_MS));
    }

    private void endGame(GameRoom room) {
        room.setStatus(RoomStatus.FINISHED);
        List<LeaderboardEntry> leaderboard = buildLeaderboard(room);
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), new GameOverEvent(leaderboard));
        persistResults(room);
    }

    private List<LeaderboardEntry> buildLeaderboard(GameRoom room) {
        return room.getPlayers().values().stream()
                .sorted((a, b) -> b.getScore() - a.getScore())
                .map(p -> new LeaderboardEntry(p.getNickname(), p.getScore()))
                .collect(Collectors.toList());
    }

    private void persistResults(GameRoom room) {
        for (PlayerState player : room.getPlayers().values()) {
            List<QuestionResult> details = new ArrayList<>();
            int correctCount = 0;
            for (int i = 0; i < room.getQuestions().size(); i++) {
                Question q = room.getQuestions().get(i);
                String selected = player.getAnswersGiven().getOrDefault(i, "");
                boolean correct = q.getRightAnswer().equals(selected);
                if (correct) correctCount++;
                details.add(new QuestionResult(q.getPk(), q.getQuestionTitle(), selected, q.getRightAnswer(), correct));
            }

            QuizAttempt attempt = new QuizAttempt();
            attempt.setQuizId(room.getQuizId());
            attempt.setQuizTitle(room.getQuizTitle() + " (Multiplayer)");
            attempt.setPlayerName(player.getNickname());
            attempt.setCategory(room.getCategory());
            attempt.setDifficultyLevel(room.getDifficultyLevel());
            attempt.setScore(correctCount);
            attempt.setTotal(room.getQuestions().size());
            attempt.setSubmittedAt(LocalDateTime.now());
            attempt.setRoomCode(room.getRoomCode());
            try {
                attempt.setDetailsJson(mapper.writeValueAsString(details));
            } catch (Exception e) {
                attempt.setDetailsJson("[]");
            }
            quizAttemptRepository.save(attempt);
        }
    }

    private void broadcastPlayers(GameRoom room) {
        List<String> names = new ArrayList<>(room.getPlayers().keySet());
        messagingTemplate.convertAndSend("/topic/room/" + room.getRoomCode(), new PlayerJoinedEvent(names));
    }

    private String generateRoomCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        String code;
        do {
            StringBuilder sb = new StringBuilder();
            Random rnd = new Random();
            for (int i = 0; i < 6; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
            code = sb.toString();
        } while (rooms.containsKey(code));
        return code;
    }
}