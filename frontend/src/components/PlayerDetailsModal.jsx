import { useState } from 'react';
import { User, Mail, Play } from 'lucide-react';

function PlayerDetailsModal({ onStart }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onStart(name.trim(), email.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="glass-card p-7 sm:p-8 rounded-2xl max-w-sm w-full border border-zinc-800 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-1">Before you start</h2>
        <p className="text-sm text-zinc-400 mb-6">Tell us who's playing</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email (optional)"
              className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
          >
            <Play className="w-4 h-4" />
            <span>Start Quiz</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default PlayerDetailsModal;