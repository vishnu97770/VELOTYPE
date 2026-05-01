import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  // Mock data for the improvement graph
  const mockData = [
    { day: 'Mon', wpm: 45, acc: 92 },
    { day: 'Tue', wpm: 48, acc: 94 },
    { day: 'Wed', wpm: 46, acc: 91 },
    { day: 'Thu', wpm: 52, acc: 95 },
    { day: 'Fri', wpm: 55, acc: 96 },
    { day: 'Sat', wpm: 58, acc: 97 },
    { day: 'Sun', wpm: 62, acc: 98 },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome back, <span style={{color: 'var(--theme-main)'}}>{user?.username || 'User'}</span></h1>
        <p style={styles.subtitle}>Here's how your AI-assisted typing is improving.</p>
      </div>

      <div style={styles.statsGrid}>
        <div className="floating-container" style={styles.statCard}>
          <div style={styles.statLabel}>Average WPM</div>
          <div style={styles.statValue}>52</div>
          <div style={styles.statTrend}>+12% this week</div>
        </div>
        <div className="floating-container" style={styles.statCard}>
          <div style={styles.statLabel}>Average Accuracy</div>
          <div style={styles.statValue}>94%</div>
          <div style={styles.statTrend}>+2% this week</div>
        </div>
        <div className="floating-container" style={styles.statCard}>
          <div style={styles.statLabel}>Tests Completed</div>
          <div style={styles.statValue}>128</div>
          <div style={styles.statTrend}>42 this week</div>
        </div>
      </div>

      <div className="floating-container" style={styles.chartContainer}>
        <h3 style={styles.chartTitle}>Performance History (WPM)</h3>
        <div style={styles.chartWrapper}>
          {/* Simple custom bar chart */}
          {mockData.map((d, i) => (
            <div key={i} style={styles.barColumn}>
              <div style={styles.barLabelTop}>{d.wpm}</div>
              <div style={{
                ...styles.barFill,
                height: `${(d.wpm / 70) * 100}%`,
              }}></div>
              <div style={styles.barLabel}>{d.day}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="floating-container" style={styles.historyContainer}>
        <h3 style={styles.chartTitle}>Recent Sessions</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>WPM</th>
              <th style={styles.th}>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} style={styles.tr}>
                <td style={styles.td}>Today, 10:4{i} AM</td>
                <td style={styles.td}>60s</td>
                <td style={styles.td}>6{i}</td>
                <td style={styles.td}>9{i}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    color: 'var(--text-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '30px',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '10px',
  },
  title: {
    fontSize: '2.5rem',
    margin: 0,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.1rem',
    marginTop: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  statCard: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  statValue: {
    fontSize: '3rem',
    fontWeight: '700',
    color: 'var(--theme-main)',
    textShadow: 'var(--theme-glow)',
    lineHeight: 1,
  },
  statTrend: {
    color: 'var(--theme-secondary)',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  chartContainer: {
    padding: '30px',
  },
  chartTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.2rem',
    color: '#fff',
  },
  chartWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '200px',
    paddingTop: '20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  barColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    gap: '8px',
  },
  barFill: {
    width: '40px',
    background: 'linear-gradient(0deg, var(--theme-secondary) 0%, var(--theme-main) 100%)',
    borderRadius: '4px 4px 0 0',
    boxShadow: 'var(--theme-glow)',
    transition: 'height 0.5s ease',
  },
  barLabel: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginTop: '4px',
  },
  barLabelTop: {
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  historyContainer: {
    padding: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#94a3b8',
    fontWeight: 'normal',
    fontSize: '0.9rem',
  },
  td: {
    padding: '16px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  tr: {
    transition: 'background 0.2s',
  }
};
