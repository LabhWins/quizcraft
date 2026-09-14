import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistory, getMyHistory } from '../../api/quizApi';
import { Clock, ChevronRight, Trash2, User, Shield, Sparkles, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function History() {
  const { user, isAdmin } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('mine'); // 'mine' or 'all' (for admin)

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (user) {
          // Logged in user: fetch personal history or admin global history
          if (viewMode === 'all' && isAdmin) {
            const res = await getHistory();
            setAttempts(res.data);
          } else {
            const res = await getMyHistory();
            setAttempts(res.data);
          }
        } else {
          // Guest: read from localStorage
          const localData = JSON.parse(localStorage.getItem('guest_quiz_history') || '[]');
          setAttempts(localData);
        }
      } catch (err) {
        console.error('Failed to load history', err);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, isAdmin, viewMode]);

  const handleClearGuestHistory = () => {
    if (window.confirm('Clear your temporary guest quiz history?')) {
      localStorage.removeItem('guest_quiz_history');
      setAttempts([]);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading history...</div>;
  }

  return (
    <div className="px-6 py-10 max-w-3xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Quiz History
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {user ? (
              <span>Showing records for <strong className="text-amber-400">@{user.username}</strong></span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400/90">
                <Sparkles className="w-3.5 h-3.5" /> Guest Mode (Saved on this device)
              </span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Admin Switcher */}
          {isAdmin && (
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('mine')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${viewMode === 'mine' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                My History
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${viewMode === 'all' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                  }`}
              >
                All Users (Admin)
              </button>
            </div>
          )}

          {/* Guest Clear History Button */}
          {!user && attempts.length > 0 && (
            <button
              onClick={handleClearGuestHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-2 rounded-xl transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Attempts List */}
      {attempts.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl border border-slate-800">
          <p className="text-slate-400 mb-4">No quiz attempts found.</p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl font-semibold text-sm transition-all"
          >
            Take a Quiz
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {attempts.map((a) => {
            const pct = a.total > 0 ? Math.round((a.score / a.total) * 100) : 0;
            const scoreColor =
              pct >= 80
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                : pct >= 50
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/25';

            return (
              <Link
                key={a.id}
                to={`/result/${a.id}`}
                className="glass-card p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-4 border border-slate-800 hover:border-amber-500/40 transition-all group hover:-translate-y-0.5"
              >
                <div className="flex-1 min-w-0">
                  {/* Top line: Name + Category & Difficulty Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base group-hover:text-amber-300 transition-colors truncate">
                      {a.playerName || 'Anonymous'}
                    </span>
                    {a.category && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold uppercase tracking-wider">
                        {a.category}
                      </span>
                    )}
                    {a.difficultyLevel && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-slate-300 text-[11px] font-medium capitalize">
                        {a.difficultyLevel}
                      </span>
                    )}
                  </div>

                  {/* Sub line: Quiz title + Timestamp inline */}
                  <div className="flex items-center gap-2.5 mt-1 text-xs text-slate-400 flex-wrap">
                    <span className="text-slate-300 truncate max-w-xs font-medium">
                      {a.quizTitle || 'Quiz Attempt'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(a.submittedAt).toLocaleDateString()} {new Date(a.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Right side: Color-coded Score Pill + Chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`px-2.5 py-1 rounded-lg border text-xs sm:text-sm font-bold font-mono ${scoreColor}`}>
                    {a.score}/{a.total} <span className="text-[10px] font-normal opacity-80">({pct}%)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default History;
