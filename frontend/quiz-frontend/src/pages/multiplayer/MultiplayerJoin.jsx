import { useState, useEffect, useRef } from 'react';
import { getRoomInfo } from '../../api/multiplayerApi';
import { Swords, ArrowLeft, Loader2, AlertCircle, Users } from 'lucide-react';
import { useGameSocket } from '../../hooks/useGameSocket';
import LiveGameScreen from '../../components/LiveGameScreen';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function MultiplayerJoin() {
  const { code: urlCode } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Room code state — 6 characters, uppercase
  const [roomCode, setRoomCode] = useState(urlCode?.toUpperCase() || '');
  const [nickname, setNickname] = useState(user?.username || '');
  const [roomInfo, setRoomInfo] = useState(null);
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  // For the 6-box code input
  const inputRefs = useRef([]);

  // If we have a URL code, auto-validate on mount
  useEffect(() => {
    if (urlCode) {
      fetchRoom(urlCode.toUpperCase());
    }
  }, [urlCode]);

  // Auto-fill nickname when user logs in
  useEffect(() => {
    if (user?.username && !nickname) {
      setNickname(user.username);
    }
  }, [user]);

  const fetchRoom = async (code) => {
    setLoading(true);
    setError('');
    try {
      const res = await getRoomInfo(code);
      setRoomInfo(res.data);
    } catch {
      setRoomInfo(null);
      setError('Room not found. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // WebSocket connection — only connect after user clicks join
  const { connected, lastEvent, sendMessage } = useGameSocket(joined ? roomCode : null);

  useEffect(() => {
    if (lastEvent?.type === 'GAME_OVER') {
      navigate(`/multiplayer/${roomCode}/results`);
    }
  }, [lastEvent]);

  useEffect(() => {
    if (lastEvent?.type === 'QUESTION_STARTED') setGameStarted(true);
  }, [lastEvent]);

  useEffect(() => {
    if (joined && connected) {
      sendMessage(`/app/room/${roomCode}/join`, { nickname });
    }
  }, [joined, connected]);

  // Handle the 6-box code input
  const handleCodeChange = (index, value) => {
    // Only allow alphanumeric
    const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!char) return;

    const newCode = roomCode.split('');
    newCode[index] = char.charAt(0);
    const updated = newCode.join('');
    setRoomCode(updated);
    setError('');

    // Auto-focus next box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-validate when all 6 chars are entered
    if (updated.length === 6 && index === 5) {
      fetchRoom(updated);
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newCode = roomCode.split('');
      if (newCode[index]) {
        newCode[index] = '';
        setRoomCode(newCode.join(''));
        setError('');
      } else if (index > 0) {
        newCode[index - 1] = '';
        setRoomCode(newCode.join(''));
        inputRefs.current[index - 1]?.focus();
        setError('');
      }
    }
  };

  const handleCodePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
    if (pasted.length > 0) {
      setRoomCode(pasted.padEnd(6, '').slice(0, 6).trimEnd());
      // Focus last filled box
      const lastIdx = Math.min(pasted.length - 1, 5);
      inputRefs.current[lastIdx]?.focus();
      if (pasted.length === 6) {
        fetchRoom(pasted);
      }
    }
  };

  const handleLookup = () => {
    if (roomCode.length === 6) {
      fetchRoom(roomCode);
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    setJoined(true);
  };

  // — Render: Game in progress
  if (gameStarted) {
    return <LiveGameScreen roomCode={roomCode} nickname={nickname} isHost={false} lastEvent={lastEvent} sendMessage={sendMessage} />;
  }

  // — Render: Waiting in lobby
  if (joined) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-12">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-2">
          <Loader2 className="w-7 h-7 text-amber-400 animate-spin" />
        </div>
        <p className="text-zinc-300 font-medium">Waiting for host to start the game...</p>
        <p className="text-xs text-zinc-500">Room: <span className="font-mono text-amber-400">{roomCode}</span></p>
      </div>
    );
  }

  // — Render: Main join UI
  return (
    <div className="px-6 py-16 max-w-md mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 mx-auto mb-4">
            <Swords className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-white mb-1">Join Live Game</h1>
          <p className="text-sm text-zinc-400">
            {urlCode ? 'You\'ve been invited!' : 'Enter the 6-character room code to join'}
          </p>
        </div>

        {/* Room Code Input — 6 boxes */}
        {!roomInfo && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-zinc-400 mb-3 text-center uppercase tracking-wider">Room Code</label>
            <div className="flex justify-center gap-2 mb-4" onPaste={handleCodePaste}>
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={roomCode[i] || ''}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  disabled={!!urlCode}
                  className={`w-11 h-13 text-center text-lg font-bold font-mono rounded-xl border outline-none transition-all
                    ${urlCode
                      ? 'bg-zinc-800/50 border-zinc-700 text-amber-400 cursor-default'
                      : 'bg-zinc-900 border-zinc-700/80 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 hover:border-zinc-600'
                    }
                    ${error ? 'border-rose-500/50' : ''}
                  `}
                  style={{ caretColor: 'transparent' }}
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 text-rose-400 text-xs justify-center mb-4">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex items-center gap-2 text-amber-400 text-xs justify-center mb-4">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Looking up room...</span>
              </div>
            )}

            {/* Manual lookup button (for partial paste or manual typing) */}
            {!loading && !error && roomCode.length === 6 && !roomInfo && (
              <button
                onClick={handleLookup}
                className="w-full py-2.5 rounded-xl bg-zinc-800 border border-zinc-700/80 hover:border-amber-500/40 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-all cursor-pointer"
              >
                Find Room
              </button>
            )}
          </div>
        )}

        {/* Room Found — Show details + join form */}
        {roomInfo && (
          <div className="animate-fadeIn">
            {/* Room Info Badge */}
            <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                  <Users className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{roomInfo.hostName}'s Quiz</p>
                  <p className="text-xs text-zinc-400 truncate">{roomInfo.quizTitle}</p>
                </div>
                <span className="ml-auto px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 text-[10px] font-mono font-bold uppercase shrink-0">
                  {roomCode}
                </span>
              </div>
            </div>

            {/* Nickname + Join */}
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Your Nickname</label>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={user ? `@${user.username}` : 'Enter a nickname'}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
              >
                Join Game
              </button>
            </form>

            {/* Change code link */}
            {!urlCode && (
              <button
                onClick={() => { setRoomInfo(null); setRoomCode(''); setError(''); inputRefs.current[0]?.focus(); }}
                className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 mt-3 transition-colors cursor-pointer"
              >
                ← Enter a different code
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiplayerJoin;
