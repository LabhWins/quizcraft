import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn, ArrowLeft, Clock } from 'lucide-react';

const PREMADE_ACCOUNTS = [
  { role: 'Admin', username: 'admin1', password: 'test 123' },
  { role: 'User', username: 'user1', password: 'test 123' },
  { role: 'User', username: 'newuser2', password: 'test 123' },
];

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

  const handleQuickFill = (acc) => {
    setUsername(acc.username);
    setPassword(acc.password);
    setError('');
  };

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
    <div className="px-6 py-16 max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-5">
        {/* Main Login Form */}
        <div className="glass-card p-7 sm:p-8 rounded-2xl border border-zinc-800 shadow-2xl w-full max-w-sm">
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

        {/* Minimal Quick Demo Accounts Sidebar */}
        <div className="glass-card p-5 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 w-full md:w-56 shrink-0 shadow-xl self-stretch md:self-auto flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800/80">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Demo Logins</span>
              <span className="text-[10px] font-mono text-amber-400/90 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                test 123
              </span>
            </div>

            <div className="space-y-1.5">
              {PREMADE_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickFill(acc)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/80 hover:border-zinc-700 transition-colors text-left cursor-pointer group"
                >
                  <span className="text-xs font-mono text-zinc-300 group-hover:text-amber-300 transition-colors">
                    {acc.username}
                  </span>
                  <span className={`text-[10px] font-mono font-medium ${acc.role === 'Admin' ? 'text-amber-400/90' : 'text-zinc-500'}`}>
                    {acc.role.toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 text-center space-y-1.5">
            <p className="text-[10px] text-zinc-500">
              Click to autofill
            </p>
            <p className="text-[11px] text-zinc-400 leading-tight">
              You can create your own credentials too by{' '}
              <Link to="/register" className="text-amber-400 hover:underline">
                registering
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
