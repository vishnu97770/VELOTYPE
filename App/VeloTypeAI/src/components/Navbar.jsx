import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_CSS = `
.nb-nav {
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(10,10,10,0.82);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(255,214,0,0.08);
  transition: background 0.3s, border-color 0.3s;
}
.nb-nav.nb-scrolled {
  background: rgba(10,10,10,0.96);
  border-bottom-color: rgba(255,214,0,0.14);
}
.nb-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.nb-logo {
  font-family: 'Outfit', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  text-decoration: none;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
}
.nb-logo-y { color: #FFD600; text-shadow: 0 0 20px rgba(255,214,0,0.5); }
.nb-links {
  display: flex;
  gap: 4px;
  align-items: center;
}
.nb-link {
  color: #555;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 7px;
  transition: color 0.2s, background 0.2s;
  font-family: 'JetBrains Mono', monospace;
}
.nb-link:hover { color: #d1d0c5; background: rgba(255,255,255,0.05); }
.nb-link.nb-active { color: #FFD600; }
.nb-auth { display: flex; align-items: center; gap: 10px; }
.nb-user { font-size: 13px; color: rgba(255,214,0,0.7); font-family: 'JetBrains Mono', monospace; }
.nb-signin {
  padding: 8px 18px;
  border-radius: 8px;
  background: #FFD600;
  color: #0A0A0A;
  font-weight: 800;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(255,214,0,0.3);
}
.nb-signin:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(255,214,0,0.45);
  color: #0A0A0A;
}
.nb-logout {
  padding: 7px 16px;
  border-radius: 8px;
  background: transparent;
  color: #ca4754;
  font-weight: 600;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  border: 1px solid rgba(202,71,84,0.35);
  cursor: pointer;
  transition: all 0.2s;
}
.nb-logout:hover { background: rgba(202,71,84,0.08); border-color: rgba(202,71,84,0.6); }
@media (max-width: 640px) {
  .nb-links { display: none; }
  .nb-inner { padding: 0 16px; }
}
`;

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const active = (path) => location.pathname === path ? 'nb-link nb-active' : 'nb-link';

  return (
    <>
      <style>{NAV_CSS}</style>
      <nav className={`nb-nav${scrolled ? ' nb-scrolled' : ''}`}>
        <div className="nb-inner">
          <Link to="/" className="nb-logo">
            Velo<span className="nb-logo-y">Type</span>AI
          </Link>

          <div className="nb-links">
            <Link to="/"              className={active('/')}>Home</Link>
            <Link to="/type"          className={active('/type')}>Practice</Link>
            <Link to="/multiplayer"   className={active('/multiplayer')}>Race</Link>
            <Link to="/leaderboard"   className={active('/leaderboard')}>Leaderboard</Link>
            {isLoggedIn && <Link to="/dashboard" className={active('/dashboard')}>Dashboard</Link>}
          </div>

          <div className="nb-auth">
            {isLoggedIn ? (
              <>
                <span className="nb-user">{user?.username}</span>
                <button onClick={logout} className="nb-logout">Logout</button>
              </>
            ) : (
              <Link to="/login" className="nb-signin">Sign In</Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
