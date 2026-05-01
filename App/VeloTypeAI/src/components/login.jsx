import React, { useState, useEffect } from 'react';
import '../assets/styles/login.css';
import Footer from './footer.jsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Login() {
  const { login, register, isLoggedIn } = useAuth();
  const navigator = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) navigator('/');
  }, [isLoggedIn, navigator]);

  // ── Tab state ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'

  // ── Register form state ────────────────────────────────────
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    verifyEmail: '',
    password: '',
    verifyPassword: '',
  });
  const [registerError,   setRegisterError]   = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  // ── Sign In form state ─────────────────────────────────────
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError,   setLoginError]   = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [rememberMe,   setRememberMe]   = useState(true);

  // ── Handlers ───────────────────────────────────────────────

  const handleRegisterChange = (e) => {
    setRegisterData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setRegisterError('');
    setRegisterSuccess('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');

    // Client-side validation
    if (!registerData.username.trim()) {
      setRegisterError('Username is required.');
      return;
    }
    if (registerData.email !== registerData.verifyEmail) {
      setRegisterError('Emails do not match.');
      return;
    }
    if (registerData.password.length < 6) {
      setRegisterError('Password must be at least 6 characters.');
      return;
    }
    if (registerData.password !== registerData.verifyPassword) {
      setRegisterError('Passwords do not match.');
      return;
    }

    setRegisterLoading(true);
    try {
      await register({
        username: registerData.username.trim(),
        email:    registerData.email.trim(),
        password: registerData.password,
      });
      setRegisterSuccess('🎉 Account created! You can now sign in.');
      setRegisterData({ username: '', email: '', verifyEmail: '', password: '', verifyPassword: '' });
      // Auto-switch to sign in tab after 1.5s
      setTimeout(() => setActiveTab('signin'), 1500);
    } catch (err) {
      setRegisterError(err.message || 'Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleLoginChange = (e) => {
    setLoginData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLoginError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginData.username.trim()) {
      setLoginError('Username is required.');
      return;
    }
    if (!loginData.password) {
      setLoginError('Password is required.');
      return;
    }

    setLoginLoading(true);
    try {
      await login({
        username: loginData.username.trim(),
        password: loginData.password,
      });
      navigator('/');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="login-page">
      <header>
        <div className="logo-container">
          <div className="logo-icon">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
              <path d="M432 96a48 48 0 1048 48 48 48 0 00-48-48zM302.59 217.16c-30-29.35-77.85-29-106.91 1s-28.71 78.69 1.25 108 77.85 29 106.91-1 28.71-78.69-1.25-108zM149.34 163a32 32 0 11-32 32 32 32 0 0132-32zm213.32 0a32 32 0 11-32 32 32 32 0 0132-32zM256 368c-44.18 0-80-48.42-80-64 0-11 8.95-20 20-20h120c11.05 0 20 8.95 20 20 0 15.58-35.82 64-80 64z"></path>
              <path d="M414.39 337.56c-19.14-19-19-49.79.28-68.59l41.6-40.59c19.33-18.86 19.33-49.44 0-68.3l-41.6-40.59c-19.14-19-19-49.79.28-68.59a48 48 0 00-67.73 0c-19.33 18.86-50.6 18.86-69.93 0a48 48 0 00-67.73 0c-19.14 19-50.41 19-69.55 0a48 48 0 00-67.73 0c-19.33 18.86-19.33 49.44 0 68.3l41.6 40.59c19.28 18.8 19.42 49.59.28 68.59l-41.6 40.59c-19.33 18.86-19.33 49.44 0 68.3l41.6 40.59c19.14 19 19 49.79-.28 68.59a48 48 0 0067.73 0c19.33-18.86 50.6-18.86 69.93 0a48 48 0 0067.73 0c19.14-19 50.41-19 69.55 0a48 48 0 0067.73 0c19.33-18.86 19.33-49.44 0-68.3z"></path>
            </svg>
          </div>
          <div className="logo-text">
            <span style={{ color: 'var(--sub-color)', fontSize: '0.8rem', display: 'block', marginBottom: '-0.3rem' }}>AI powered</span>
            VeloTypeAI
          </div>
        </div>
        <div className="nav-icons">
          <button className="back-btn" onClick={() => navigator('/')}>← back to typing</button>
        </div>
      </header>

      {/* ── Tab switcher ── */}
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
          onClick={() => { setActiveTab('signin'); setLoginError(''); }}
        >
          ← sign in
        </button>
        <button
          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => { setActiveTab('register'); setRegisterError(''); setRegisterSuccess(''); }}
        >
          + register
        </button>
      </div>

      <main>
        {/* ── SIGN IN form ── */}
        {activeTab === 'signin' && (
          <div className="form-column">
            <div className="column-title">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.4-9.4 9.4-24.6 0-34z"></path>
              </svg>
              sign in
            </div>

            {/* Social login (decorative — OAuth not wired) */}
            <div className="social-login">
              <button className="social-btn" type="button" title="Google (coming soon)" disabled>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 488 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
              </button>
              <button className="social-btn" type="button" title="GitHub (coming soon)" disabled>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 496 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"></path>
                </svg>
              </button>
            </div>
            <div className="separator">or</div>

            <form onSubmit={handleLogin} noValidate>
              <input
                id="login-username"
                type="text"
                name="username"
                placeholder="username"
                value={loginData.username}
                onChange={handleLoginChange}
                autoComplete="username"
                autoCapitalize="off"
                spellCheck="false"
                required
              />
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="password"
                value={loginData.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
                required
              />

              <div
                className={`remember-me ${rememberMe ? 'active' : ''}`}
                onClick={() => setRememberMe(!rememberMe)}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
                </svg>
                remember me
              </div>

              {loginError && (
                <div className="auth-message error" role="alert">{loginError}</div>
              )}

              <button
                id="login-submit"
                type="submit"
                className="submit-btn primary-btn"
                disabled={loginLoading}
              >
                {loginLoading ? (
                  <span className="spinner" />
                ) : (
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M416 448h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32h-84c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h84c53 0 96 43 96 96v192c0 53-43 96-96 96zm-47-201L201 79c-15-15-41-4.5-41 17v96H24c-13.3 0-24 10.7-24 24v80c0 13.3 10.7 24 24 24h136v96c0 21.5 26 32 41 17l168-168c9.4-9.4 9.4-24.6 0-34z"></path>
                  </svg>
                )}
                {loginLoading ? 'signing in…' : 'sign in'}
              </button>

              <a href="#" className="forgot-password">forgot password?</a>
            </form>
          </div>
        )}

        {/* ── REGISTER form ── */}
        {activeTab === 'register' && (
          <div className="form-column">
            <div className="column-title">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4zM400 168h-48v-48c0-13.3-10.7-24-24-24s-24 10.7-24 24v48h-48c-13.3 0-24 10.7-24 24s10.7 24 24 24h48v48c0 13.3 10.7 24 24 24s24-10.7 24-24v-48h48c13.3 0 24-10.7 24-24s-10.7-24-24-24z"></path>
              </svg>
              create account
            </div>

            <form onSubmit={handleRegister} noValidate>
              <input
                id="reg-username"
                type="text"
                name="username"
                placeholder="username"
                value={registerData.username}
                onChange={handleRegisterChange}
                autoComplete="username"
                autoCapitalize="off"
                spellCheck="false"
                required
              />
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="email"
                value={registerData.email}
                onChange={handleRegisterChange}
                autoComplete="email"
                required
              />
              <input
                id="reg-verify-email"
                type="email"
                name="verifyEmail"
                placeholder="verify email"
                value={registerData.verifyEmail}
                onChange={handleRegisterChange}
                autoComplete="email"
                required
              />
              <input
                id="reg-password"
                type="password"
                name="password"
                placeholder="password"
                value={registerData.password}
                onChange={handleRegisterChange}
                autoComplete="new-password"
                required
              />
              <input
                id="reg-verify-password"
                type="password"
                name="verifyPassword"
                placeholder="verify password"
                value={registerData.verifyPassword}
                onChange={handleRegisterChange}
                autoComplete="new-password"
                required
              />

              {registerError && (
                <div className="auth-message error" role="alert">{registerError}</div>
              )}
              {registerSuccess && (
                <div className="auth-message success" role="status">{registerSuccess}</div>
              )}

              <button
                id="register-submit"
                type="submit"
                className="submit-btn primary-btn"
                disabled={registerLoading}
                style={{ marginTop: '0' }}
              >
                {registerLoading ? (
                  <span className="spinner" />
                ) : (
                  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                    <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"></path>
                  </svg>
                )}
                {registerLoading ? 'creating account…' : 'sign up'}
              </button>
            </form>
          </div>
        )}
      </main>

      <div className="shortcuts-footer">
        <div className="shortcut">
          <span className="key">tab</span> + <span className="key">enter</span> - restart test
        </div>
        <div className="shortcut">
          <span className="key">esc</span> or <span className="key">cmd</span> + <span className="key">shift</span> + <span className="key">p</span> - command line
        </div>
      </div>

      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default Login;