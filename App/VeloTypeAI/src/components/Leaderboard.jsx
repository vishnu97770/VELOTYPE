import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../apiClient';

const RANK_META = {
  'Bronze':          { color: '#cd7f32', bg: 'rgba(205,127,50,0.12)',  border: 'rgba(205,127,50,0.3)'  },
  'Silver':          { color: '#c0c0c0', bg: 'rgba(192,192,192,0.12)', border: 'rgba(192,192,192,0.3)' },
  'Gold':            { color: '#FFD600', bg: 'rgba(255,214,0,0.12)',   border: 'rgba(255,214,0,0.3)'   },
  'Platinum':        { color: '#00e5cc', bg: 'rgba(0,229,204,0.12)',   border: 'rgba(0,229,204,0.3)'   },
  'Diamond':         { color: '#4fc3f7', bg: 'rgba(79,195,247,0.12)',  border: 'rgba(79,195,247,0.3)'  },
  'Immortal':        { color: '#ba68c8', bg: 'rgba(186,104,200,0.12)', border: 'rgba(186,104,200,0.3)' },
  'Velotype Master': { color: '#ff4444', bg: 'rgba(255,68,68,0.12)',   border: 'rgba(255,68,68,0.3)'   },
};

function RankBadge({ rank }) {
  const m = RANK_META[rank] || RANK_META['Bronze'];
  return (
    <span style={{
      fontSize: 11,
      fontWeight: 700,
      color: m.color,
      background: m.bg,
      border: `1px solid ${m.border}`,
      borderRadius: 20,
      padding: '2px 10px',
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: 0.5,
      whiteSpace: 'nowrap',
      textShadow: `0 0 8px ${m.color}55`,
    }}>
      {rank}
    </span>
  );
}

const CSS = `
.lb-page {
  min-height: 100vh;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 20px 80px;
  font-family: 'Outfit', sans-serif;
  color: #e2e2e2;
}
.lb-header {
  text-align: center;
  margin-bottom: 40px;
}
.lb-title {
  font-size: clamp(28px,5vw,48px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  margin-bottom: 8px;
}
.lb-title span { color: #FFD600; text-shadow: 0 0 24px rgba(255,214,0,0.5); }
.lb-subtitle { font-size: 14px; color: #555; font-family: 'JetBrains Mono', monospace; }
.lb-me-card {
  width: 100%;
  max-width: 840px;
  margin-bottom: 24px;
  background: rgba(255,214,0,0.05);
  border: 1px solid rgba(255,214,0,0.2);
  border-radius: 14px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}
.lb-me-label { font-size: 11px; color: rgba(255,214,0,0.6); text-transform: uppercase; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; margin-bottom: 4px; }
.lb-me-val { font-size: 22px; font-weight: 900; color: #FFD600; }
.lb-me-stat { display: flex; flex-direction: column; }
.lb-me-divider { width: 1px; height: 40px; background: rgba(255,214,0,0.15); flex-shrink: 0; }
.lb-table-wrap {
  width: 100%;
  max-width: 840px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
}
.lb-table {
  width: 100%;
  border-collapse: collapse;
}
.lb-table thead tr {
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.lb-table thead th {
  padding: 14px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #444;
  text-align: left;
  text-transform: uppercase;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 1px;
}
.lb-table tbody tr {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  transition: background 0.15s;
}
.lb-table tbody tr:last-child { border-bottom: none; }
.lb-table tbody tr:hover { background: rgba(255,255,255,0.03); }
.lb-table tbody tr.lb-row-me { background: rgba(255,214,0,0.04); }
.lb-table tbody tr.lb-row-me:hover { background: rgba(255,214,0,0.07); }
.lb-table tbody td {
  padding: 14px 16px;
  font-size: 14px;
  vertical-align: middle;
}
.lb-pos {
  font-size: 14px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  color: #333;
  width: 48px;
}
.lb-pos.top1 { color: #FFD600; }
.lb-pos.top2 { color: #c0c0c0; }
.lb-pos.top3 { color: '#cd7f32'; }
.lb-username {
  font-weight: 700;
  font-size: 15px;
}
.lb-username-me { color: #FFD600; }
.lb-elo {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
}
.lb-wl {
  font-size: 13px;
  color: #555;
  font-family: 'JetBrains Mono', monospace;
}
.lb-wl .w { color: #4ade80; }
.lb-wl .l { color: #f87171; }
.lb-wpm {
  font-size: 14px;
  font-weight: 700;
  color: #888;
  font-family: 'JetBrains Mono', monospace;
}
.lb-loading {
  color: #555;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 80px;
  font-size: 14px;
}
.lb-error {
  color: #ca4754;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 40px;
  font-size: 14px;
}
.lb-actions { margin-bottom: 24px; }
.lb-race-btn {
  padding: 13px 28px;
  background: #FFD600;
  color: #0A0A0A;
  font-weight: 800;
  font-size: 15px;
  font-family: 'Outfit', sans-serif;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(255,214,0,0.3);
  text-decoration: none;
  transition: all 0.2s;
  display: inline-block;
}
.lb-race-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255,214,0,0.45);
  color: #0A0A0A;
}
@media (max-width: 600px) {
  .lb-table thead th:nth-child(4),
  .lb-table tbody td:nth-child(4) { display: none; }
}
`;

export default function Leaderboard() {
  const { isLoggedIn, user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!isLoggedIn) return;
    apiClient('/leaderboard/?limit=50')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  const myId = user?.user_id || '';

  const posClass = (pos) => {
    if (pos === 1) return 'top1';
    if (pos === 2) return 'top2';
    if (pos === 3) return 'top3';
    return '';
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="lb-page">
        <div className="lb-header">
          <h1 className="lb-title">Global <span>Leaderboard</span></h1>
          <p className="lb-subtitle">Top players ranked by ELO rating</p>
        </div>

        {isLoggedIn && (
          <div className="lb-actions">
            <Link to="/multiplayer" className="lb-race-btn">⚡ Race Now →</Link>
          </div>
        )}

        {loading && <p className="lb-loading">Loading leaderboard…</p>}
        {error   && <p className="lb-error">{error}</p>}

        {data && (
          <>
            {/* Current user card */}
            <div className="lb-me-card">
              <div className="lb-me-stat">
                <span className="lb-me-label">Your Rank</span>
                <span className="lb-me-val">#{data.my_position}</span>
              </div>
              <div className="lb-me-divider" />
              <div className="lb-me-stat">
                <span className="lb-me-label">ELO</span>
                <span className="lb-me-val">{data.my_elo}</span>
              </div>
              <div className="lb-me-divider" />
              <div className="lb-me-stat">
                <span className="lb-me-label">Division</span>
                <div style={{ marginTop: 4 }}>
                  <RankBadge rank={data.my_rank} />
                </div>
              </div>
              <div className="lb-me-divider" />
              <div className="lb-me-stat">
                <span className="lb-me-label">Total Players</span>
                <span className="lb-me-val">{data.total_users}</span>
              </div>
            </div>

            {/* Leaderboard table */}
            <div className="lb-table-wrap">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>ELO</th>
                    <th>W / L</th>
                    <th>Avg WPM</th>
                  </tr>
                </thead>
                <tbody>
                  {data.entries.map(e => (
                    <tr
                      key={e.user_id}
                      className={e.is_me ? 'lb-row-me' : ''}
                    >
                      <td>
                        <span className={`lb-pos ${posClass(e.position)}`}>
                          {e.position === 1 ? '🥇' : e.position === 2 ? '🥈' : e.position === 3 ? '🥉' : `#${e.position}`}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span className={`lb-username${e.is_me ? ' lb-username-me' : ''}`}>
                            {e.username}
                            {e.is_me && <span style={{ color: '#555', fontWeight: 400, fontSize: 12, marginLeft: 6 }}>you</span>}
                          </span>
                          <RankBadge rank={e.rank_name} />
                        </div>
                      </td>
                      <td><span className="lb-elo">{e.elo}</span></td>
                      <td>
                        <span className="lb-wl">
                          <span className="w">{e.wins}W</span>
                          {' / '}
                          <span className="l">{e.losses}L</span>
                        </span>
                      </td>
                      <td><span className="lb-wpm">{e.avg_wpm} wpm</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!isLoggedIn && (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <p style={{ color: '#555', fontFamily: "'JetBrains Mono', monospace", marginBottom: 20 }}>
              Sign in to see your rank and compete
            </p>
            <Link to="/login" className="lb-race-btn">Sign In →</Link>
          </div>
        )}
      </div>
    </>
  );
}
