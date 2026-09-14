import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getChallengeInfo } from '../../api/challengeApi';
import { Swords, Loader2, ArrowLeft } from 'lucide-react';

function ChallengeJoin() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await getChallengeInfo(token);
        setChallenge(res.data);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, [token]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading challenge...</div>;
  if (!challenge) return <div className="p-12 text-center text-slate-400">Challenge not found.</div>;

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
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-sm">
          <Swords className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">
          {challenge.creatorName} challenged you!
        </h1>
        <p className="text-sm text-zinc-400 mb-6">
          {challenge.quizTitle} · <span className="capitalize text-zinc-300">{challenge.category}</span> · <span className="capitalize text-zinc-300">{challenge.difficultyLevel}</span>
        </p>
        <button
          onClick={() => navigate(`/quiz/${challenge.quizId}?challenge=${token}`)}
          className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
        >
          <Swords className="w-4 h-4" />
          <span>Accept Challenge</span>
        </button>
      </div>
      </div>
    </div>
  );
}

export default ChallengeJoin;
