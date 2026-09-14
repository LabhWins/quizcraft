import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttempt } from '../../api/quizApi';
import { Trophy, CheckCircle2, XCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createChallenge } from '../../api/challengeApi';
import { Swords, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/clipboard';

function ResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [challengeLink, setChallengeLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateChallenge = async () => {
    try {
      const res = await createChallenge(result.quizId, result.attemptId);
      const link = `${window.location.origin}/challenge/${res.data.token}`;
      setChallengeLink(link);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(challengeLink);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchAttempt = async () => {
      try {
        const res = await getAttempt(attemptId);
        setResult(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading result...</div>;
  if (!result) return <div className="p-12 text-center text-slate-400">Result not found.</div>;

  const percentage = Math.round((result.score / result.total) * 100);
  const message = percentage >= 80 ? "Excellent work! 🎉" : percentage >= 50 ? "Good effort! 👍" : "Keep practicing! 💪";

  return (
    <div className="px-6 py-12 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="glass-card p-8 rounded-3xl border border-zinc-800 shadow-2xl text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-sm">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h1>
        <div className="text-5xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-100 my-4">
          {percentage}%
        </div>
        <p className="text-zinc-200 text-base font-medium mb-1">
          You scored {result.score} out of {result.total}
        </p>
        <p className="text-zinc-400 text-sm mb-6">{message}</p>
        <Link
          to="/create"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Another Quiz</span>
        </Link>
        {user && (
          <div className="mt-5 pt-5 border-t border-zinc-800">
            {!challengeLink ? (
              <button
                onClick={handleCreateChallenge}
                className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-700/80 hover:border-amber-500/40 hover:bg-zinc-800 text-zinc-200 hover:text-white font-medium py-2.5 px-5 rounded-xl transition-all text-sm cursor-pointer"
              >
                <Swords className="w-4 h-4 text-amber-400" />
                <span>Challenge a Friend</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <input
                  readOnly
                  value={challengeLink}
                  className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded-xl px-3 py-2.5 w-64 font-mono outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">Review Answers</h2>
        <span className="text-xs text-slate-400 font-medium">{result.score}/{result.total} Correct</span>
      </div>

      <div className="space-y-4">
        {result.details.map((d, idx) => (
          <div key={d.pk} className={`p-5 rounded-2xl border-l-4 glass-card transition-all ${d.correct ? 'border-l-emerald-500 border-slate-800/80 bg-emerald-950/10' : 'border-l-rose-500 border-slate-800/80 bg-rose-950/10'}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="font-semibold text-white text-base">
                <span className="text-slate-400 mr-2">{idx + 1}.</span>{d.questionTitle}
              </p>
              {d.correct ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" /><span>Correct</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex-shrink-0">
                  <XCircle className="w-3.5 h-3.5" /><span>Incorrect</span>
                </span>
              )}
            </div>
            <div className="space-y-1.5 pl-6 text-sm">
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Your answer: </span>
                <span className={d.correct ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {d.selectedAnswer || '(no answer selected)'}
                </span>
              </p>
              {!d.correct && (
                <p className="text-slate-300">
                  <span className="text-slate-400 font-medium">Correct answer: </span>
                  <span className="text-emerald-400 font-semibold">{d.correctAnswer}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultPage;
