import React, { useState, useEffect } from 'react';
import '../assets/styles/login.css';
import Footer from './footer.jsx';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient.js';

const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  delay: Math.random() * 18,
  duration: Math.random() * 14 + 10,
  cyan: Math.random() > 0.5,
}));

function Login() {
  const [rememberMe, setRememberMe] = useState(true);
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const navigator = useNavigate();

  const [loginData, setLoginData] = useState({ usernameOrEmail: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerData, setRegisterData] = useState({
    username: '', email: '', verifyEmail: '', password: '', verifyPassword: '',
  });
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    if (registerData.email !== registerData.verifyEmail) {
      setRegisterError('Emails do not match.');
      return;
    }
    if (registerData.password !== registerData.verifyPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }
    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }

    setRegisterLoading(true);
    try {
      await apiClient('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      setRegisterSuccess('Account created! You can now sign in.');
      setRegisterData({ username: '', email: '', verifyEmail: '', password: '', verifyPassword: '' });
      setTimeout(() => setActiveTab('login'), 1500);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');
    setLoginLoading(true);
    try {
      // FastAPI OAuth2PasswordRequestForm requires form-encoded body with 'username' field
      const formBody = new URLSearchParams({
        username: loginData.usernameOrEmail,
        password: loginData.password,
      });

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'https://velotype-2-jn34.onrender.com/api/v1'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'include',
          body: formBody.toString(),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // data.detail can be a string or an array of validation error objects
        const detail = data?.detail;
        if (Array.isArray(detail)) {
          throw new Error(detail.map(d => d.msg || JSON.stringify(d)).join(' | '));
        }
        throw new Error(typeof detail === 'string' ? detail : 'Login failed. Please check your credentials.');
      }

      if (data?.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }

      setLoginSuccess('Welcome back! Redirecting…');
      setTimeout(() => { window.location.href = '/'; }, 1200);
    } catch (err) {
      setLoginError(err.message || 'Login failed. Try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Animated background */}
      <div className="login-bg-grid" />
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="login-particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            background: p.cyan
              ? `rgba(0,240,255,${Math.random() * 0.4 + 0.3})`
              : `rgba(167,139,250,${Math.random() * 0.3 + 0.2})`,
            boxShadow: p.cyan
              ? `0 0 ${p.size * 3}px rgba(0,240,255,0.6)`
              : `0 0 ${p.size * 3}px rgba(167,139,250,0.5)`,
            borderRadius: '50%',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Header */}
      <header>
        <div className="logo-container" onClick={() => navigator('/')}>
          <div className="logo-icon">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.5-11.5L320 48l-111.5 179.7c-9.2 15.5-29.1 20.7-44.5 11.5L95.6 187.8c2.8-6.1 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S4 141.5 4 168s21.5 48 48 48c2.6 0 5.2-.2 7.7-.6L112 376c0 13.3 10.7 24 24 24h368c13.3 0 24-10.7 24-24l52.3-160.6c2.5.4 5.1.6 7.7.6 26.5 0 48-21.5 48-48s-21.5-48-48-48z" />
            </svg>
          </div>
          <div className="logo-text">VeloTypeAI</div>
        </div>

        <div className="nav-icons">
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" title="Notifications">
            <path d="M224 512c35.32 0 63.97-28.65 63.97-64H160.03c0 35.35 28.65 64 63.97 64zm215.39-149.71c-19.32-20.76-55.47-51.99-55.47-154.29 0-77.7-54.48-139.9-127.94-155.16V32c0-17.67-14.32-32-31.98-32s-31.98 14.33-31.98 32v20.84C118.56 68.1 64.08 130.3 64.08 208c0 102.3-36.15 133.53-55.47 154.29-6 6.45-8.66 14.16-8.61 21.71.11 16.4 12.98 32 32.1 32h383.8c19.12 0 32-15.6 32.1-32 .05-7.55-2.61-15.27-8.61-21.71z" />
          </svg>
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" title="Profile">
            <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
          </svg>
        </div>
      </header>

      {/* Tab switcher */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        padding: '32px 48px 0',
        position: 'relative',
        zIndex: 10,
      }}>
        {['login', 'register'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '13px',
              fontWeight: 700,
              padding: '10px 28px',
              borderRadius: '12px',
              border: '1px solid',
              cursor: 'pointer',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              background: activeTab === tab
                ? 'linear-gradient(135deg, rgba(0,240,255,0.15), rgba(0,240,255,0.08))'
                : 'rgba(255,255,255,0.03)',
              borderColor: activeTab === tab ? 'rgba(0,240,255,0.35)' : 'rgba(255,255,255,0.06)',
              color: activeTab === tab ? '#00f0ff' : '#646669',
              boxShadow: activeTab === tab
                ? '0 0 20px rgba(0,240,255,0.15), inset 0 1px 0 rgba(0,240,255,0.15)'
                : 'none',
              transform: activeTab === tab ? 'translateY(-2px)' : 'none',
            }}
          >
            {tab === 'login' ? '→ Sign In' : '+ Sign Up'}
          </button>
        ))}
      </div>

      {/* Main Forms */}
      <main style={{ padding: '32px 48px' }}>
        {/* LOGIN CARD */}
        {activeTab === 'login' && (
          <div className="form-column" style={{ width: '380px' }}>
            <div className="column-title">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.4-9.4 9.4-24.6 0-34z" />
              </svg>
              Sign In
            </div>

            <div className="social-login">
              <button className="social-btn" title="Continue with Google">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 488 512" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                </svg>
              </button>
              <button className="social-btn" title="Continue with GitHub">
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1.3em" width="1.3em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z" />
                </svg>
              </button>
            </div>

            <div className="separator">or</div>

            <form onSubmit={handleLogin}>
              <input
                type="text"
                placeholder="username or email"
                value={loginData.usernameOrEmail}
                onChange={(e) => setLoginData({ ...loginData, usernameOrEmail: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />

              <div
                className={`remember-me ${rememberMe ? 'active' : ''}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z" />
                </svg>
                remember me
              </div>

              {loginError && <div className="form-msg error">{loginError}</div>}
              {loginSuccess && <div className="form-msg success">{loginSuccess}</div>}

              <button type="submit" className="submit-btn" disabled={loginLoading}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.4-9.4 9.4-24.6 0-34z" />
                </svg>
                <span>{loginLoading ? 'signing in…' : 'sign in'}</span>
              </button>

              <a href="#" className="forgot-password">forgot password?</a>
            </form>
          </div>
        )}

        {/* REGISTER CARD */}
        {activeTab === 'register' && (
          <div className="form-column" style={{ width: '380px' }}>
            <div className="column-title">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4zM400 168h-48v-48c0-13.3-10.7-24-24-24s-24 10.7-24 24v48h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h48v48c0 13.3 10.7 24 24 24s24-10.7 24-24v-48h48c13.3 0 24-10.7 24-24s-10.7-24-24-24z" />
              </svg>
              Sign Up
            </div>

            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="username"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="verify email"
                value={registerData.verifyEmail}
                onChange={(e) => setRegisterData({ ...registerData, verifyEmail: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="verify password"
                value={registerData.verifyPassword}
                onChange={(e) => setRegisterData({ ...registerData, verifyPassword: e.target.value })}
                required
              />

              {registerError && <div className="form-msg error">{registerError}</div>}
              {registerSuccess && <div className="form-msg success">{registerSuccess}</div>}

              <button type="submit" className="submit-btn" disabled={registerLoading} style={{ marginTop: '4px' }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" />
                </svg>
                <span>{registerLoading ? 'creating account…' : 'sign up'}</span>
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Shortcuts */}
      <div className="shortcuts-footer">
        <div className="shortcut">
          <span className="key">tab</span>
          <span>+</span>
          <span className="key">enter</span>
          <span style={{ color: 'var(--sub2, #3e4044)' }}>restart test</span>
        </div>
        <div className="shortcut">
          <span className="key">esc</span>
          <span style={{ color: 'var(--sub2, #3e4044)' }}>command line</span>
        </div>
      </div>

      <Footer />
      

    </div>
  );
}

export default Login;