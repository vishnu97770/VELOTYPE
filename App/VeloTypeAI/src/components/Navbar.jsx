import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigator = useNavigate();

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Velo<span style={{ color: '#fff', textShadow: 'var(--theme-glow)' }}>Type</span>AI
        </Link>
        
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/#features" style={styles.link}>Features</Link>
          <Link to="/type" style={styles.link}>Typing Test</Link>
          {isLoggedIn && (
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
          )}
        </div>

        <div style={styles.auth}>
          {isLoggedIn ? (
            <>
              <span style={styles.userText}>{user?.username}</span>
              <button onClick={logout} className="btn-3d" style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="btn-3d" style={styles.loginBtn}>Sign In</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    width: '100%',
    padding: '20px 0',
    background: 'rgba(11, 15, 25, 0.8)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--theme-main)',
    textDecoration: 'none',
    letterSpacing: '1px',
  },
  links: {
    display: 'flex',
    gap: '30px',
    alignItems: 'center',
  },
  link: {
    color: '#d1d0c5',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  auth: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  loginBtn: {
    background: 'var(--theme-main)',
    color: '#0b0f19',
    padding: '8px 20px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '14px',
    border: 'none',
    boxShadow: '0 4px 0 rgba(0, 150, 160, 0.5)',
  },
  logoutBtn: {
    background: 'transparent',
    color: '#ca4754',
    padding: '8px 20px',
    borderRadius: '8px',
    border: '1px solid rgba(202, 71, 84, 0.5)',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 4px 0 rgba(202, 71, 84, 0.2)',
  },
  userText: {
    color: 'var(--theme-main)',
    fontSize: '14px',
  }
};
