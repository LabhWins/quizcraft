import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Brain, PlusCircle, FolderKanban, Sparkles, Clock } from 'lucide-react';
import Home from './pages/Home';
import QuestionManager from './pages/admin/QuestionManager';
import CreateQuiz from './pages/quiz/CreateQuiz';
import TakeQuiz from './pages/quiz/TakeQuiz';
import ScrollToTop from './components/ScrollToTop';
import ResultPage from './pages/quiz/ResultPage';
import History from './pages/quiz/History';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ChallengeJoin from './pages/challenge/ChallengeJoin';
import ChallengeResult from './pages/challenge/ChallengeResult';
import MultiplayerHost from './pages/multiplayer/MultiplayerHost';
import MultiplayerJoin from './pages/multiplayer/MultiplayerJoin';
import MultiplayerResults from './pages/multiplayer/MultiplayerResults';
import AuditLog from './pages/admin/AuditLog';
import NotFound from './pages/NotFound';


function App() {
  const location = useLocation();
  const { user, isAdmin, logout, remainingMs } = useAuth();
  const questionsBasePath = isAdmin ? '/admin/questions' : '/user/questions';

  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-zinc-800/80 px-4 lg:px-8 py-3 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/quizfavicon.png"
                alt="QuizCraft"
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-0.5">
              quiz<span className="text-amber-400">craft</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1.5 md:gap-3">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive('/')
                  ? 'bg-zinc-800 text-white border border-zinc-700/60 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to={`${questionsBasePath}?mode=ai`}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${location.pathname === questionsBasePath && location.search.includes('mode=ai')
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                    }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Generator</span>
                </Link>
                <Link
                  to={questionsBasePath}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${location.pathname === questionsBasePath && !location.search.includes('mode=ai')
                      ? 'bg-zinc-800 text-white border border-zinc-700/60 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                    }`}
                >
                  <FolderKanban className="w-4 h-4 text-zinc-400" />
                  <span>Questions</span>
                </Link>
              </>
            )}
            {isAdmin && (
              <Link
                to="/audit-log"
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive('/audit-log')
                    ? 'bg-zinc-800 text-white border border-zinc-700/60'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
              >
                Activity Log
              </Link>
            )}
            <Link
              to="/history"
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive('/history')
                  ? 'bg-zinc-800 text-white border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                }`}
            >
              History
            </Link>
            {user ? (
              <button
                onClick={() => { if (window.confirm('Are you sure you want to log out?')) logout(); }}
                className="ml-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all cursor-pointer"
              >
                Logout ({user.username})
              </button>
            ) : (
              <Link
                to="/login"
                className="ml-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all"
              >
                Login
              </Link>
            )}
            {user && (
              <div
                title="Session inactivity countdown"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 ml-1.5 shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{formatTime(remainingMs)}</span>
              </div>
            )}
          </nav>
        </div>
      </header>


      {/* Main Content View */}
      <main className="flex-1">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/quiz/:id" element={<TakeQuiz />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute adminOnly>
                <QuestionManager />
              </ProtectedRoute>
            } />
          <Route
            path="/user/questions"
            element={
              <ProtectedRoute>
                <QuestionManager />
              </ProtectedRoute>
            } />
          <Route path="/result/:attemptId" element={<ResultPage />} />
          <Route path="/history" element={<History />} />
          <Route path="/challenge/:token" element={<ChallengeJoin />} />
          <Route path="/challenge/:token/result" element={<ChallengeResult />} />
          <Route path="/multiplayer/host" element={<ProtectedRoute><MultiplayerHost /></ProtectedRoute>} />
          <Route path="/multiplayer/join/:code" element={<MultiplayerJoin />} />
          <Route path="/multiplayer/join" element={<MultiplayerJoin />} />
          <Route path="/multiplayer/:code/results" element={<MultiplayerResults />} />
          <Route path="/audit-log" element={<ProtectedRoute adminOnly><AuditLog /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
