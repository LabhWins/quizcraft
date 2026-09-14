import { Link } from 'react-router-dom';
import { FileQuestion, Home, ArrowLeft, Swords } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        {/* Glow effect & Icon */}
        <div className="relative mx-auto w-24 h-24 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center shadow-inner">
            <FileQuestion className="w-10 h-10 text-amber-400" />
          </div>
        </div>

        {/* Status code & Title */}
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs font-semibold uppercase tracking-wider mb-3">
          Error 404
        </span>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">
          Page Not Found
        </h1>
        <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
          The page you are looking for doesn't exist, may have moved, or the room link has expired.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Link
            to="/multiplayer/join"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-200 hover:text-white font-medium text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>Join Live Game</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
