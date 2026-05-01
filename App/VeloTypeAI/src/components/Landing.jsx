import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './footer.jsx';

export default function Landing() {
  return (
    <div style={styles.page}>
      {/* Hero Section */}
      <header style={styles.hero}>
        <h1 style={styles.headline}>Type Faster with <span style={styles.highlight}>AI Precision</span></h1>
        <p style={styles.subtext}>
          Experience the future of typing. Our AI predicts your words and helps you improve speed and accuracy in real-time.
        </p>
        <div style={styles.ctaGroup}>
          <Link to="/type" className="btn-3d" style={styles.primaryBtn}>Start Typing</Link>
          <Link to="/type" className="btn-3d" style={styles.secondaryBtn}>Try Demo</Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" style={styles.section}>
        <h2 style={styles.sectionTitle}>Smart Features</h2>
        <div style={styles.grid}>
          <div className="floating-container" style={styles.card}>
            <div style={styles.icon}>🧠</div>
            <h3 style={styles.cardTitle}>AI Predictions</h3>
            <p style={styles.cardText}>Real-time ghost text appears ahead of your cursor to guide your keystrokes.</p>
          </div>
          <div className="floating-container" style={styles.card}>
            <div style={styles.icon}>⚡</div>
            <h3 style={styles.cardTitle}>Speed Analytics</h3>
            <p style={styles.cardText}>Track your WPM and accuracy over time with personalized dashboards.</p>
          </div>
          <div className="floating-container" style={styles.card}>
            <div style={styles.icon}>🎯</div>
            <h3 style={styles.cardTitle}>Smart Corrections</h3>
            <p style={styles.cardText}>Learn from your mistakes with dynamic highlighting and intelligent feedback.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section style={{...styles.section, background: 'rgba(255,255,255,0.02)'}}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <div style={styles.stepsContainer}>
          <div style={styles.step}>
            <div style={styles.stepNumber}>1</div>
            <h4>Start Typing</h4>
            <p>Jump right into the typing test interface.</p>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>2</div>
            <h4>AI Predicts</h4>
            <p>Our engine anticipates your next word.</p>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.step}>
            <div style={styles.stepNumber}>3</div>
            <h4>Improve</h4>
            <p>Review your dashboard and get faster.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    color: 'var(--text-color)',
  },
  hero: {
    padding: '120px 20px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '24px',
  },
  headline: {
    fontSize: '4.5rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: '1.2',
    letterSpacing: '-1px',
  },
  highlight: {
    color: 'var(--theme-main)',
    textShadow: 'var(--theme-glow)',
  },
  subtext: {
    fontSize: '1.2rem',
    color: '#94a3b8',
    maxWidth: '600px',
    lineHeight: '1.6',
    margin: '0',
  },
  ctaGroup: {
    display: 'flex',
    gap: '20px',
    marginTop: '20px',
  },
  primaryBtn: {
    background: 'var(--theme-main)',
    color: '#0b0f19',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1.1rem',
    border: 'none',
    boxShadow: '0 6px 0 rgba(0, 150, 160, 0.5), 0 10px 20px rgba(0, 240, 255, 0.2)',
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
  secondaryBtn: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '1.1rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 6px 0 rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  },
  section: {
    padding: '80px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '60px',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    width: '100%',
  },
  card: {
    padding: '40px 30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    cursor: 'default',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '10px',
    filter: 'drop-shadow(var(--theme-glow))',
  },
  cardTitle: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0,
  },
  cardText: {
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0,
  },
  stepsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '1000px',
    width: '100%',
    gap: '20px',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    flex: 1,
  },
  stepNumber: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(0, 240, 255, 0.1)',
    border: '2px solid var(--theme-main)',
    color: 'var(--theme-main)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '20px',
    boxShadow: 'var(--theme-glow)',
  },
  stepLine: {
    height: '2px',
    background: 'rgba(255,255,255,0.1)',
    flex: 1,
    marginTop: '-40px',
  }
};
