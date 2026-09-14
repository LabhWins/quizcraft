import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizQuestions, submitQuiz } from '../../api/quizApi';
import { CheckCircle2, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import ToastContainer from '../../components/ToastContainer';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import PlayerDetailsModal from '../../components/PlayerDetailsModal';
import { useSearchParams } from 'react-router-dom';
import { completeChallenge } from '../../api/challengeApi';
import { useAuth } from '../../context/AuthContext';

function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { pk: selectedOption }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toasts, showToast, removeToast } = useToast();
  const [player, setPlayer] = useState(() => (user ? { name: user.username, email: '' } : null));
  const [searchParams] = useSearchParams();
  const challengeToken = searchParams.get('challenge');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await getQuizQuestions(id);
        setQuestions(res.data);
      } catch (err) {
        setError('Could not load this quiz session. Please verify it exists.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleStart = (name, email) => {
    setPlayer({ name, email });
  };

  const handleSelect = (pk, option) => {
    setAnswers({ ...answers, [pk]: option });
  };

  const handleSubmit = async () => {
    const responses = questions.map((q) => ({
      pk: q.pk,
      response: answers[q.pk] || '',
    }));
    try {
      const res = await submitQuiz(id, player?.name || 'Guest', player?.email || '', responses);
      if (!user) {
        try {
          const guestHistory = JSON.parse(localStorage.getItem('guest_quiz_history') || '[]');
          const newAttempt = {
            id: res.data.attemptId,
            quizTitle: questions[0]?.category ? `${questions[0].category.toUpperCase()} Quiz` : `Quiz #${id}`,
            playerName: player?.name || 'Guest',
            category: questions[0]?.category || '',
            difficultyLevel: questions[0]?.difficultyLevel || '',
            score: res.data.score,
            total: res.data.total,
            submittedAt: new Date().toISOString(),
          };
          localStorage.setItem('guest_quiz_history', JSON.stringify([newAttempt, ...guestHistory]));
        } catch (e) {
          console.error('Failed to save guest history locally', e);
        }
      }
      if (challengeToken) {
        await completeChallenge(challengeToken, res.data.attemptId);
        navigate(`/challenge/${challengeToken}/result`);
      } else {
        navigate(`/result/${res.data.attemptId}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit quiz.', 'error');
    }
  };
  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading quiz session...</div>;
  }
  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 glass-card rounded-2xl text-center border border-zinc-800">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <p className="text-rose-300 font-medium mb-4">{error}</p>
        <Link to="/create" className="text-sm text-amber-400 hover:underline">
          Return to Quiz Generator
        </Link>
      </div>
    );
  }
  if (questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 glass-card rounded-2xl text-center border border-zinc-800">
        <HelpCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <p className="text-zinc-300 mb-6">This quiz has no questions available. Try generating one with a category that contains questions.</p>
        <Link to="/create" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all">
          <span>Create New Quiz</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }
  if (!player) {
    return <PlayerDetailsModal onStart={handleStart} />;
  }

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-2xl mx-auto">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-zinc-800/80">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Live Quiz Session</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Playing as <span className="text-amber-400 font-medium">@{player?.name || 'Guest'}</span>
          </p>
        </div>
        <div className="text-xs font-mono font-medium px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300">
          {questions.length} Questions
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((q, idx) => {
          const optionKeys = ['A', 'B', 'C', 'D'];
          const isAnswered = Boolean(answers[q.pk]);
          return (
            <div
              key={q.pk}
              className={`glass-card p-4 sm:p-5 rounded-2xl border transition-all ${isAnswered ? 'border-amber-500/30 shadow-md shadow-black/30' : 'border-zinc-800'
                }`}
            >
              <h3 className="text-sm sm:text-base font-semibold text-white mb-3.5 flex items-start gap-2.5">
                <span className={`w-5 h-5 rounded-md text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border ${isAnswered
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700/60'
                  }`}>
                  {idx + 1}
                </span>
                <span className="leading-snug">{q.questionTitle}</span>
              </h3>

              {/* Compact 2-Column Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[q.option1, q.option2, q.option3, q.option4].map((opt, optIdx) => {
                  const isSelected = answers[q.pk] === opt;
                  return (
                    <label
                      key={opt}
                      className={`flex items-start p-2.5 sm:p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                          ? 'border-amber-500/60 bg-amber-500/15 text-amber-200 font-medium shadow-sm'
                          : 'border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-300 hover:border-zinc-700'
                        }`}
                    >
                      <input
                        type="radio"
                        name={`question-${q.pk}`}
                        value={opt}
                        checked={isSelected}
                        onChange={() => handleSelect(q.pk, opt)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 rounded-md text-[10px] font-mono font-bold flex items-center justify-center mr-2.5 shrink-0 mt-0.5 border ${isSelected
                          ? 'bg-amber-500 text-black border-amber-400'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700/80'
                        }`}>
                        {optionKeys[optIdx]}
                      </span>
                      <span className="text-xs sm:text-sm leading-snug break-words flex-1">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Submit CTA */}
      <button
        onClick={handleSubmit}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer transition-all text-sm sm:text-base"
      >
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>Submit Completed Quiz</span>
      </button>
    </div>
  );
}

export default TakeQuiz;
