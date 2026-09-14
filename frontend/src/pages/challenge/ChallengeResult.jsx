import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getChallengeResult } from '../../api/challengeApi';
import { Trophy, Swords, ArrowLeft } from 'lucide-react';

function ChallengeResult() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchResult = async () => {
      try {
        const res = await getChallengeResult(token);
        setResult(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [token]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading result...</div>;
  if (!result) return <div className="p-12 text-center text-slate-400">Result not found.</div>;

  const creatorPct = Math.round((result.creatorScore / result.creatorTotal) * 100);
  const opponentPct = Math.round((result.opponentScore / result.opponentTotal) * 100);

  return (
    <div className="px-6 py-16 max-w-lg mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="text-center">
      <div className="glass-card p-8 rounded-3xl border border-zinc-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-sm">
          <Swords className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">{result.quizTitle}</h1>
        <p className="text-sm text-zinc-400 mb-8">Challenge Complete</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-5 rounded-2xl border ${result.winner === 'creator' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/60'}`}>
            {result.winner === 'creator' && <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-2" />}
            <p className="font-semibold text-white">{result.creatorName}</p>
            <p className="text-3xl font-bold font-mono text-amber-400 my-2">{creatorPct}%</p>
            <p className="text-xs text-zinc-400 font-mono">{result.creatorScore}/{result.creatorTotal}</p>
          </div>
          <div className={`p-5 rounded-2xl border ${result.winner === 'opponent' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-zinc-800 bg-zinc-900/60'}`}>
            {result.winner === 'opponent' && <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-2" />}
            <p className="font-semibold text-white">{result.opponentName}</p>
            <p className="text-3xl font-bold font-mono text-amber-400 my-2">{opponentPct}%</p>
            <p className="text-xs text-zinc-400 font-mono">{result.opponentScore}/{result.opponentTotal}</p>
          </div>
        </div>

        <p className="text-zinc-200 font-medium mb-6">
          {result.winner === 'tie' ? "It's a tie! 🤝" : `${result.winner === 'creator' ? result.creatorName : result.opponentName} wins! 🎉`}
        </p>

        <Link to="/create" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all text-sm cursor-pointer">
          <span>Create Your Own Quiz</span>
        </Link>
      </div>
      </div>
    </div>
  );
}

export default ChallengeResult;
