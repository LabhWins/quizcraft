import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRoom } from '../../api/multiplayerApi';
import { getCategorySummary } from '../../api/questionApi';
import { Swords, Copy, Check, Play, ArrowLeft, Gamepad2, Eye, Shield, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGameSocket } from '../../hooks/useGameSocket';
import LiveGameScreen from '../../components/LiveGameScreen';
import { copyToClipboard } from '../../utils/clipboard';

function MultiplayerHost() {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [numQ, setNumQ] = useState(5);
  const [room, setRoom] = useState(null); // { roomCode, hostToken }
  const [copied, setCopied] = useState(false);
  const [hostMode, setHostMode] = useState('play'); // 'play' | 'spectator'

  useEffect(() => {
    getCategorySummary().then((res) => setSummary(res.data));
  }, []);

  const { connected, lastEvent, sendMessage } = useGameSocket(room?.roomCode);
  const navigate = useNavigate();

  useEffect(() => {
    if (lastEvent?.type === 'GAME_OVER' && room) {
      navigate(`/multiplayer/${room.roomCode}/results`);
    }
  }, [lastEvent, room, navigate]);

  const [players, setPlayers] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!lastEvent) return;
    if (lastEvent.type === 'PLAYER_JOINED') {
      setPlayers(lastEvent.players);
    }
    if (lastEvent.type === 'QUESTION_STARTED') {
      setGameStarted(true);
    }
  }, [lastEvent]);

  // Auto-join host as player if in 'play' mode
  useEffect(() => {
    if (room && connected && hostMode === 'play' && user?.username) {
      sendMessage(`/app/room/${room.roomCode}/join`, { nickname: user.username });
    }
  }, [room, connected, hostMode, user?.username, sendMessage]);

  const categories = [...new Set(summary.map((s) => s.category))];
  const difficulties = summary.filter((s) => s.category === category);

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createRoom(category, difficulty, numQ, user.username);
    setRoom(res.data);
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(`${window.location.origin}/multiplayer/join/${room.roomCode}`);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleStart = () => {
    sendMessage(`/app/room/${room.roomCode}/start`, { hostToken: room.hostToken });
  };

  if (gameStarted) {
    return (
      <LiveGameScreen
        roomCode={room.roomCode}
        nickname={user.username}
        isHost={true}
        isSpectator={hostMode === 'spectator'}
        lastEvent={lastEvent}
        sendMessage={sendMessage}
      />
    );
  }

  if (room) {
    return (
      <div className="px-6 py-12 max-w-md mx-auto text-center">
        <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">Room Code</p>
          <p className="text-4xl font-bold font-mono text-amber-400 tracking-widest mb-4">{room.roomCode}</p>

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-sm font-medium px-4 py-2 rounded-xl mb-6 cursor-pointer border border-zinc-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy Join Link'}</span>
          </button>

          {/* Host Mode Indicator Badge */}
          <div className="mb-6 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 font-mono">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Role: <strong className="text-amber-300">{hostMode === 'play' ? 'Play & Host' : 'Spectator'}</strong></span>
            </span>
          </div>

          <div className="border-t border-zinc-800 pt-6 mb-6">
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-3 flex items-center justify-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-zinc-400" />
              <span>Connected Players ({players.length})</span>
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {players.length === 0 ? (
                <p className="text-sm text-zinc-500">Waiting for players to join...</p>
              ) : (
                players.map((p) => {
                  const isHostPlayer = p === user.username;
                  return (
                    <span
                      key={p}
                      className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-medium ${
                        isHostPlayer
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-zinc-900 border-zinc-700/60 text-zinc-300'
                      }`}
                    >
                      {p} {isHostPlayer ? '(You 👑)' : ''}
                    </span>
                  );
                })
              )}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={players.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-40 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Start Game</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12 max-w-md mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Host a Live Quiz</h1>
            <p className="text-xs text-zinc-400">Create a synchronized game room</p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setDifficulty(''); }}
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
            >
              <option value="" disabled>Select category</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              required
              disabled={!category}
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none cursor-pointer disabled:opacity-40"
            >
              <option value="" disabled>Select difficulty</option>
              {difficulties.map((d) => <option key={d.difficultyLevel} value={d.difficultyLevel}>{d.difficultyLevel} ({d.count} available)</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Number of Questions</label>
            <input
              type="number"
              min="1"
              max="20"
              value={numQ}
              onChange={(e) => setNumQ(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 text-zinc-100 rounded-xl px-4 py-3 text-sm outline-none font-mono"
            />
          </div>

          {/* Host Role Preference */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">Host Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHostMode('play')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hostMode === 'play'
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span>Play & Host</span>
              </button>

              <button
                type="button"
                onClick={() => setHostMode('spectator')}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hostMode === 'spectator'
                    ? 'border-amber-500/60 bg-amber-500/15 text-amber-300 font-semibold shadow-sm'
                    : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Spectator</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            Create Room
          </button>
        </form>
      </div>
    </div>
  );
}

export default MultiplayerHost;
