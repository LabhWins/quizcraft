import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ArrowLeft, Clock } from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [inactivityNotice, setInactivityNotice] = useState(() => {
    const reason = sessionStorage.getItem('logout_reason');
    if (reason === 'inactivity') {
      sessionStorage.removeItem('logout_reason');
      return true;
    }
    return false;
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      const msg =
        typeof err.response?.data === 'string'
          ? err.response.data
          : err.response?.data?.message || 'Login failed. Check your credentials.';
      setError(msg);
    }
  };

  return (
    <div className="px-6 py-16 max-w-sm mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <div className="glass-card p-8 rounded-2xl border border-zinc-800 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-zinc-400 mb-6">Log in to your account</p>

        {inactivityNotice && (
          <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
            <span>You were logged out due to 15 minutes of inactivity.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
            className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-zinc-100 rounded-xl px-4 py-2.5 text-sm placeholder-zinc-500 outline-none transition-all"
          />
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all cursor-pointer text-sm"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In</span>
          </button>
        </form>

        <p className="text-sm text-zinc-400 mt-6 text-center">
          Don't have an account? <Link to="/register" className="text-amber-400 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
