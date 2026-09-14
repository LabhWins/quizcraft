import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { login as loginApi, register as registerApi } from '../api/authApi';

const AuthContext = createContext(null);
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [remainingMs, setRemainingMs] = useState(IDLE_TIMEOUT_MS);
  const lastActivityRef = useRef(Date.now());

  const login = async (username, password) => {
    const res = await loginApi(username, password);
    const { token, username: uname, role } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username: uname, role }));
    setUser({ username: uname, role });
    lastActivityRef.current = Date.now();
    setRemainingMs(IDLE_TIMEOUT_MS);
  };

  const register = async (username, email, password) => {
    await registerApi(username, email, password);
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    if (!user) return;
    const resetActivity = () => { lastActivityRef.current = Date.now(); };
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, resetActivity));
    return () => events.forEach((e) => window.removeEventListener(e, resetActivity));
  }, [user]);

  const hasTimedOutRef = useRef(false);

  useEffect(() => {
    if (!user) return;
    hasTimedOutRef.current = false;
    const interval = setInterval(() => {
      const remaining = IDLE_TIMEOUT_MS - (Date.now() - lastActivityRef.current);
      if (remaining <= 0) {
        clearInterval(interval);
        if (!hasTimedOutRef.current) {
          hasTimedOutRef.current = true;
          logout();
          sessionStorage.setItem('logout_reason', 'inactivity');
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }
      } else {
        setRemainingMs(remaining);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user, logout]);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin, remainingMs }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}