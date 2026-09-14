import { useState, useEffect } from 'react';
import { Trophy, Clock, Eye, Gamepad2, CheckCircle2, Users } from 'lucide-react';

function LiveGameScreen({ roomCode, nickname, isHost, isSpectator = false, lastEvent, sendMessage }) {
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerCount, setAnswerCount] = useState({ answered: 0, total: 0 });
  const [questionResult, setQuestionResult] = useState(null);
  const [gameOver, setGameOver] = useState(null);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'QUESTION_STARTED') {
      setQuestion(lastEvent);
      setSelected(null);
      setQuestionResult(null);
      setTimeLeft(lastEvent.durationMs / 1000);
    }
    if (lastEvent.type === 'ANSWER_COUNT') {
      setAnswerCount({ answered: lastEvent.answered, total: lastEvent.total });
    }
    if (lastEvent.type === 'QUESTION_ENDED') {
      setQuestionResult(lastEvent);
    }
    if (lastEvent.type === 'GAME_OVER') {
      setGameOver(lastEvent);
    }
  }, [lastEvent]);

  useEffect(() => {
    if (timeLeft <= 0 || questionResult) return;
    const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, questionResult]);

  const handleAnswer = (option) => {
    if (isSpectator || selected || questionResult) return;
    setSelected(option);
    sendMessage(`/app/room/${roomCode}/answer`, {
      nickname,
      questionIndex: question.questionIndex,
      selectedOption: option,
    });
  };

  if (gameOver) {
    return (
      <div className="px-6 py-16 max-w-md mx-auto text-center">
        <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-6">Final Leaderboard</h1>
          <div className="space-y-2">
            {gameOver.finalLeaderboard.map((p, idx) => (
              <div
                key={p.nickname}
                className={`flex items-center justify-between p-3.5 rounded-xl ${
                  idx === 0
                    ? 'bg-amber-500/15 border border-amber-500/35 text-amber-300'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs opacity-70">#{idx + 1}</span>
                  <span className="font-bold">{p.nickname}</span>
                </div>
                <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!question) return <div className="p-12 text-center text-zinc-400">Starting game...</div>;

  const optionLabels = ['A', 'B', 'C', 'D'];
  const totalDuration = (question.durationMs || 15000) / 1000;
  const progressPct = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));

  return (
    <div className="px-4 sm:px-6 py-10 max-w-2xl mx-auto">
      {/* Game Mode Pill & Status */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {isSpectator ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>Master Screen (Spectator)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Playing as @{nickname}</span>
            </span>
          )}
        </div>

        <span className="text-xs text-zinc-400 font-mono">
          Question {question.questionIndex + 1} of {question.totalQuestions}
        </span>
      </div>

      {/* Timer Bar */}
      <div className="w-full bg-zinc-800/80 rounded-full h-2 mb-6 overflow-hidden border border-zinc-700/60">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft <= 5 ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Main Question Card */}
      <div className="glass-card p-6 sm:p-7 rounded-2xl border border-zinc-800 shadow-xl mb-6 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Prompt</span>
          <span className="flex items-center gap-1.5 text-sm font-semibold font-mono text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> {timeLeft}s
          </span>
        </div>

        <h2 className="text-base sm:text-lg font-semibold text-white mb-6 leading-snug">
          {question.questionTitle}
        </h2>

        {/* 2-Column Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[question.option1, question.option2, question.option3, question.option4].map((opt, optIdx) => {
            const isSelected = selected === opt;
            const isCorrect = questionResult && opt === questionResult.correctAnswer;
            const showResult = !!questionResult;

            let optStyle = 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:border-zinc-700';

            if (showResult) {
              if (isCorrect) {
                optStyle = 'border-emerald-500/60 bg-emerald-500/15 text-emerald-300 font-medium';
              } else if (isSelected && !isCorrect) {
                optStyle = 'border-rose-500/60 bg-rose-500/15 text-rose-300 font-medium';
              } else {
                optStyle = 'border-zinc-800/60 bg-zinc-900/40 text-zinc-500 opacity-60';
              }
            } else if (isSelected) {
              optStyle = 'border-amber-500/60 bg-amber-500/15 text-amber-200 font-medium shadow-sm';
            } else if (isSpectator) {
              optStyle = 'border-zinc-800 bg-zinc-900/70 text-zinc-300 cursor-default';
            }

            return (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={isSpectator || !!selected || showResult}
                className={`p-3.5 rounded-xl border text-sm font-medium transition-all text-left break-words flex items-start gap-2.5 ${
                  isSpectator ? 'cursor-default' : 'cursor-pointer'
                } ${optStyle}`}
              >
                <span className="w-5 h-5 rounded-md bg-zinc-800/80 border border-zinc-700/60 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 text-zinc-400">
                  {optionLabels[optIdx]}
                </span>
                <span className="flex-1 leading-snug">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Answer Counter Bar */}
      {!questionResult && (
        <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-zinc-500" />
            <span>Player Submissions:</span>
          </span>
          <span className="font-bold text-amber-400">
            {answerCount.answered} / {answerCount.total || '?'} answered
          </span>
        </div>
      )}

      {/* Round Leaderboard (Shown between questions) */}
      {questionResult && (
        <div className="glass-card p-5 sm:p-6 rounded-2xl border border-zinc-800 shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2.5">
            <p className="text-xs text-zinc-400 uppercase tracking-wider font-mono font-semibold">
              Live Standings
            </p>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct: {questionResult.correctAnswer}
            </span>
          </div>

          <div className="space-y-2">
            {questionResult.leaderboard.map((p, idx) => (
              <div
                key={p.nickname}
                className={`flex items-center justify-between p-2.5 rounded-xl text-sm ${
                  idx === 0
                    ? 'bg-amber-500/10 border border-amber-500/30 font-semibold'
                    : 'bg-zinc-900/60 border border-zinc-800'
                }`}
              >
                <span className="text-zinc-200">
                  <span className="font-mono text-xs text-zinc-500 mr-2">#{idx + 1}</span>
                  {p.nickname}
                </span>
                <span className="font-mono font-bold text-amber-400">{p.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveGameScreen;