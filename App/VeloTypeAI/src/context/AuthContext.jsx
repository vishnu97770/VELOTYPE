import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://velotype-backend.onrender.com/api/v1';

// ── Fetch with timeout (handles Render cold-start delays) ──────────────────────
async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      throw new Error('Server is waking up — please try again in a few seconds.');
    }
    throw err;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // { user_id, username, email, ... }
  const [token, setToken]     = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);   // initial me-check in progress

  // ── Persist token & hydrate user on mount ────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    // Verify the stored token is still valid by fetching /me
    fetchWithTimeout(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: 'include',
    }, 15000)
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          _clearSession();
        }
      })
      .catch(() => _clearSession())
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Internal helpers ─────────────────────────────────────────────────────────
  function _saveSession(accessToken, userData) {
    localStorage.setItem('access_token', accessToken);
    setToken(accessToken);
    setUser(userData);
  }

  function _clearSession() {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }

  // ── register ─────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ username, email, password }) => {
    const res = await fetchWithTimeout(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Registration failed.');
    return data;
  }, []);

  // ── login ────────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ username, password }) => {
    // FastAPI OAuth2PasswordRequestForm expects form-encoded body
    const formBody = new URLSearchParams({ username, password });

    const res = await fetchWithTimeout(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      credentials: 'include',  // receives the httpOnly refresh-token cookie
      body: formBody.toString(),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Login failed.');

    const { access_token } = data;

    // Fetch user profile immediately after login
    const meRes = await fetchWithTimeout(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${access_token}` },
      credentials: 'include',
    }, 10000).catch(() => null);

    const userData = (meRes && meRes.ok) ? await meRes.json() : { username };

    _saveSession(access_token, userData);
    return userData;
  }, []);

  // ── logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    _clearSession();
  }, []);

  // ── context value ────────────────────────────────────────────────────────────
  const value = { user, token, loading, register, login, logout, isLoggedIn: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
