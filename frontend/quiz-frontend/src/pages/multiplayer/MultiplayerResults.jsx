import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMultiplayerResults } from '../../api/multiplayerApi';
import { Trophy, ArrowLeft } from 'lucide-react';

function MultiplayerResults() {
  const { code } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getMultiplayerResults(code).then((res) => setData(res.data));
  }, [code]);

  if (!data) return <div className="p-12 text-center text-slate-400">Loading results...</div>;

  return (
    <div className="px-6 py-16 max-w-md mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="text-center">
      <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-white mb-1">{data.quizTitle}</h1>
        <p className="text-sm text-zinc-400 mb-6">Final Leaderboard</p>
        <div className="space-y-2">
          {data.leaderboard.map((p, idx) => (
            <div key={p.nickname} className={`flex items-center justify-between p-3 rounded-xl ${idx === 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800'}`}>
              <span className="font-medium text-white">{idx + 1}. {p.nickname}</span>
              <span className="font-mono font-bold text-amber-400">{p.score}</span>
            </div>
          ))}
        </div>
        <Link to="/multiplayer/host" className="inline-block mt-6 text-sm text-amber-400 hover:underline">
          Host Another Game
        </Link>
      </div>
      </div>
    </div>
  );
}

export default MultiplayerResults;
