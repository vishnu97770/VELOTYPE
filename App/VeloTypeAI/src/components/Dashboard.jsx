import { useState, useEffect, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../apiClient.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(mins) {
  if (!mins) return '0:00:00';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  const s = Math.floor((mins * 60) % 60);
  return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function movingAvg(arr, w = 10) {
  return arr.map((_, i) => {
    const sl = arr.slice(Math.max(0, i - w + 1), i + 1);
    return sl.reduce((a, b) => a + b, 0) / sl.length;
  });
}

function pct(arr, p) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  return sorted[Math.floor(p * (sorted.length - 1))];
}

// ─── Activity Heatmap (GitHub-style) ─────────────────────────────────────────

const ActivityHeatmap = memo(function ActivityHeatmap({ history }) {
  const { cells, maxCount } = useMemo(() => {
    const map = {};
    history.forEach(s => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    const max = Math.max(...Object.values(map), 1);
    const today = new Date();
    const grid = [];
    for (let w = 51; w >= 0; w--) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const dt = new Date(today);
        dt.setDate(today.getDate() - w * 7 - (6 - d));
        const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
        const count = map[key] || 0;
        col.push({ key, count, label: dt.toDateString() });
      }
      grid.push(col);
    }
    return { cells: grid, maxCount: max };
  }, [history]);

  const CELL = 13, GAP = 2;
  const intensityColor = (n) => {
    if (n === 0) return '#1a1a1a';
    const t = Math.max(0.18, n / maxCount);
    return `rgba(255,214,0,${t})`;
  };

  return (
    <div className="db-heatmap-wrap">
      <div className="db-heatmap-days-col">
        <span>mon</span>
        <span>wed</span>
        <span>fri</span>
      </div>
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <svg width={52*(CELL+GAP)} height={7*(CELL+GAP)+2} style={{ display: 'block' }}>
          {cells.map((col, wi) => col.map((cell, di) => (
            <rect
              key={cell.key}
              x={wi*(CELL+GAP)} y={di*(CELL+GAP)}
              width={CELL} height={CELL} rx={2}
              fill={intensityColor(cell.count)}
            >
              <title>{cell.label}: {cell.count} session{cell.count!==1?'s':''}</title>
            </rect>
          )))}
        </svg>
      </div>
    </div>
  );
});

// ─── Scatter Plot ─────────────────────────────────────────────────────────────

const ScatterPlot = memo(function ScatterPlot({ history }) {
  const n = history.length;
  if (n === 0) return <div className="db-empty">No sessions in this period.</div>;

  const W = 820, H = 260;
  const P = { t: 20, r: 40, b: 35, l: 44 };
  const iW = W - P.l - P.r, iH = H - P.t - P.b;

  const wpms = history.map(s => s.wpm);
  const accs = history.map(s => s.accuracy);
  const maxW = Math.ceil((Math.max(...wpms, 30)+10)/10)*10;
  const minW = Math.max(0, Math.floor((Math.min(...wpms,30)-5)/10)*10);

  const xS = i => P.l + (i / Math.max(n-1,1)) * iW;
  const yW = v => P.t + iH - ((v - minW)/(maxW - minW||1)) * iH;
  const yA = v => P.t + iH - (v/100) * iH;

  const avgW = movingAvg(wpms, 10);
  const avgA = movingAvg(accs, 10);
  const wPath = avgW.map((v,i)=>`${i===0?'M':'L'}${xS(i).toFixed(1)},${yW(v).toFixed(1)}`).join(' ');
  const aPath = avgA.map((v,i)=>`${i===0?'M':'L'}${xS(i).toFixed(1)},${yA(v).toFixed(1)}`).join(' ');

  const wTicks = [];
  for (let v = minW; v <= maxW; v += 10) wTicks.push(v);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto', overflow:'visible' }}>
      <defs>
        <clipPath id="sc-clip"><rect x={P.l} y={P.t} width={iW} height={iH}/></clipPath>
      </defs>

      {/* Grid lines + WPM y-axis */}
      {wTicks.map(v => (
        <g key={v}>
          <line x1={P.l} y1={yW(v)} x2={W-P.r} y2={yW(v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1}/>
          <text x={P.l-6} y={yW(v)+4} textAnchor="end" fill="#3a3a3a" fontSize={10} fontFamily="JetBrains Mono,monospace">{v}</text>
        </g>
      ))}

      {/* Accuracy y-axis right */}
      {[0,20,40,60,80,100].map(v => (
        <text key={v} x={W-P.r+6} y={yA(v)+4} textAnchor="start" fill="#1e3050" fontSize={10} fontFamily="JetBrains Mono,monospace">{v}</text>
      ))}

      {/* Axes */}
      <line x1={P.l} y1={P.t+iH} x2={W-P.r} y2={P.t+iH} stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>
      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t+iH} stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>

      {/* Accuracy dots */}
      <g clipPath="url(#sc-clip)">
        {history.map((s,i) => <circle key={i} cx={xS(i)} cy={yA(s.accuracy)} r={2.5} fill="rgba(80,120,220,0.3)"/>)}
      </g>

      {/* WPM dots */}
      <g clipPath="url(#sc-clip)">
        {history.map((s,i) => (
          <circle key={i} cx={xS(i)} cy={yW(s.wpm)} r={3.5} fill="rgba(255,214,0,0.55)">
            <title>{s.wpm} WPM · {s.accuracy}% acc</title>
          </circle>
        ))}
      </g>

      {/* Trend lines */}
      {n > 1 && <path d={aPath} fill="none" stroke="rgba(80,120,220,0.55)" strokeWidth={1.5} strokeLinecap="round" clipPath="url(#sc-clip)"/>}
      {n > 1 && <path d={wPath} fill="none" stroke="#FFD600" strokeWidth={2.5} strokeLinecap="round" clipPath="url(#sc-clip)"/>}

      {/* Axis labels */}
      <text x={12} y={P.t+iH/2} fill="#333" fontSize={9} fontFamily="JetBrains Mono,monospace"
        transform={`rotate(-90,12,${P.t+iH/2})`} textAnchor="middle">WPM</text>
      <text x={W-6} y={P.t+iH/2} fill="#1e3050" fontSize={9} fontFamily="JetBrains Mono,monospace"
        transform={`rotate(90,${W-6},${P.t+iH/2})`} textAnchor="middle">accuracy</text>
    </svg>
  );
});

// ─── WPM Histogram ────────────────────────────────────────────────────────────

const WpmHistogram = memo(function WpmHistogram({ history }) {
  if (!history.length) return <div className="db-empty">No data.</div>;

  const BUCKETS = 13; // 0-9, 10-19, ... 120+
  const counts = Array(BUCKETS).fill(0);
  history.forEach(s => { counts[Math.min(BUCKETS-1, Math.floor(s.wpm/10))]++; });
  const maxC = Math.max(...counts, 1);

  const W = 820, H = 200;
  const P = { t: 10, r: 20, b: 34, l: 46 };
  const iW = W-P.l-P.r, iH = H-P.t-P.b;
  const bW = (iW/BUCKETS) - 3;

  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      {yTicks.map(p => {
        const y = P.t + iH - p*iH;
        return (
          <g key={p}>
            <line x1={P.l} y1={y} x2={W-P.r} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1}/>
            <text x={P.l-5} y={y+4} textAnchor="end" fill="#3a3a3a" fontSize={10} fontFamily="JetBrains Mono,monospace">{Math.round(p*maxC)}</text>
          </g>
        );
      })}
      {counts.map((c, i) => {
        const x  = P.l + i*(iW/BUCKETS) + 1.5;
        const bH = (c/maxC)*iH;
        const y  = P.t + iH - bH;
        const lbl = i < BUCKETS-1 ? `${i*10}-${i*10+9}` : '120+';
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={bH} rx={2}
              fill={c===maxC && c>0 ? '#FFD600' : 'rgba(255,214,0,0.4)'}>
              <title>{lbl} WPM: {c} tests</title>
            </rect>
            <text x={x+bW/2} y={P.t+iH+18} textAnchor="middle" fill="#2e2e2e" fontSize={8.5} fontFamily="JetBrains Mono,monospace">{lbl}</text>
          </g>
        );
      })}
      <line x1={P.l} y1={P.t+iH} x2={W-P.r} y2={P.t+iH} stroke="rgba(255,255,255,0.08)"/>
      <line x1={P.l} y1={P.t} x2={P.l} y2={P.t+iH} stroke="rgba(255,255,255,0.08)"/>
      <text x={14} y={P.t+iH/2} fill="#333" fontSize={9} fontFamily="JetBrains Mono,monospace"
        transform={`rotate(-90,14,${P.t+iH/2})`} textAnchor="middle">tests</text>
    </svg>
  );
});

// ─── Daily Activity Bars ──────────────────────────────────────────────────────

const DailyChart = memo(function DailyChart({ history }) {
  const days = useMemo(() => {
    const map = {};
    history.forEach(s => {
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.keys(map).sort().slice(-30).map(k => ({ date: k, count: map[k] }));
  }, [history]);

  if (!days.length) return <div className="db-empty">No data.</div>;

  const W = 820, H = 100;
  const P = { t: 8, r: 20, b: 26, l: 40 };
  const iW = W-P.l-P.r, iH = H-P.t-P.b;
  const maxC = Math.max(...days.map(d=>d.count), 1);
  const bW = Math.max(6, iW/days.length - 2);
  const step = Math.ceil(days.length / 7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:'100%', height:'auto' }}>
      {days.map((d, i) => {
        const x  = P.l + (i/days.length)*iW;
        const bH = (d.count/maxC)*iH;
        return (
          <g key={d.date}>
            <rect x={x} y={P.t+iH-bH} width={bW} height={bH} rx={2} fill="rgba(255,214,0,0.5)">
              <title>{d.date}: {d.count} sessions</title>
            </rect>
            {i % step === 0 && (
              <text x={x+bW/2} y={P.t+iH+14} textAnchor="middle" fill="#2e2e2e" fontSize={8} fontFamily="JetBrains Mono,monospace">{d.date.slice(5)}</text>
            )}
          </g>
        );
      })}
      <line x1={P.l} y1={P.t+iH} x2={W-P.r} y2={P.t+iH} stroke="rgba(255,255,255,0.06)"/>
      {[0.5,1].map(p => (
        <g key={p}>
          <line x1={P.l} y1={P.t+iH-p*iH} x2={W-P.r} y2={P.t+iH-p*iH} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4"/>
          <text x={P.l-5} y={P.t+iH-p*iH+4} textAnchor="end" fill="#2e2e2e" fontSize={9} fontFamily="JetBrains Mono,monospace">{Math.round(p*maxC)}</text>
        </g>
      ))}
    </svg>
  );
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const DB_STYLES = `
.db-root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 24px 80px;
  font-family: 'JetBrains Mono', monospace;
  color: #d1d0c5;
}
.db-loading, .db-error {
  text-align: center;
  padding: 100px 24px;
  color: #555;
  font-family: 'JetBrains Mono', monospace;
}
.db-empty { text-align: center; padding: 36px; color: #333; font-size: 13px; }

/* ── Header Card ── */
.db-header-card {
  display: flex;
  align-items: center;
  gap: 28px;
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 28px 32px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.db-avatar {
  width: 76px; height: 76px;
  border-radius: 50%;
  background: rgba(255,214,0,0.1);
  border: 2px solid rgba(255,214,0,0.3);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Outfit', sans-serif;
  font-size: 30px; font-weight: 800; color: #FFD600;
  flex-shrink: 0;
  box-shadow: 0 0 24px rgba(255,214,0,0.1);
}
.db-user-info { flex: 1; min-width: 120px; }
.db-username {
  font-family: 'Outfit', sans-serif;
  font-size: 26px; font-weight: 800; color: #fff;
  margin: 0 0 4px; letter-spacing: -0.5px;
}
.db-join-line { font-size: 11px; color: #444; margin: 0; }
.db-header-stats { display: flex; gap: 40px; flex-wrap: wrap; }
.db-hstat { text-align: left; }
.db-hstat-label { display: block; font-size: 10px; color: #444; margin-bottom: 4px; letter-spacing: 0.3px; }
.db-hstat-val {
  display: block; font-family: 'Outfit', sans-serif;
  font-size: 26px; font-weight: 700; color: #d1d0c5;
}

/* ── Personal Bests Card ── */
.db-bests-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 22px 32px;
  margin-bottom: 14px;
}
.db-bests-mode-label {
  font-size: 10px; color: #444; letter-spacing: 1px;
  text-transform: uppercase; margin-bottom: 16px;
}
.db-bests-cols {
  display: flex; gap: 0;
  justify-content: space-around;
  flex-wrap: wrap;
}
.db-best-col { text-align: center; min-width: 90px; padding: 0 12px; }
.db-best-col + .db-best-col { border-left: 1px solid rgba(255,255,255,0.04); }
.db-best-col-lbl { font-size: 10px; color: #444; margin-bottom: 8px; }
.db-best-col-wpm {
  font-family: 'Outfit', sans-serif;
  font-size: 36px; font-weight: 700; color: #d1d0c5; line-height: 1;
}
.db-best-col-acc { font-size: 11px; color: #555; margin-top: 5px; }

/* ── Generic Card ── */
.db-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 22px 28px;
  margin-bottom: 14px;
}
.db-card-header {
  display: flex; align-items: baseline;
  justify-content: space-between; gap: 12px;
  margin-bottom: 18px;
}
.db-card-title { font-size: 11px; color: #555; letter-spacing: 0.3px; }
.db-card-sub   { font-size: 10px; color: #333; }

/* ── Heatmap ── */
.db-heatmap-wrap {
  display: flex; gap: 10px; align-items: flex-start;
}
.db-heatmap-days-col {
  display: flex; flex-direction: column;
  justify-content: space-around;
  height: calc(7 * 15px);
  padding-top: 2px;
  font-size: 9px; color: #FFD600;
  gap: 0; flex-shrink: 0;
}
.db-heatmap-note {
  margin-top: 12px; font-size: 10px; color: #2a2a2a; text-align: center;
}
.db-heatmap-legend {
  display: flex; align-items: center; gap: 6px;
  font-size: 10px; color: #444; margin-top: 10px;
  justify-content: flex-end;
}

/* ── Filter Bar ── */
.db-filter-bar {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.db-filter-section {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex; gap: 4px; flex-wrap: wrap;
}
.db-filter-tab {
  padding: 8px 18px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #444; font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer; transition: all 0.18s;
}
.db-filter-tab:hover { color: #888; border-color: rgba(255,255,255,0.12); }
.db-filter-tab.active { background: #FFD600; color: #0A0A0A; border-color: #FFD600; font-weight: 700; }

/* ── Chart Controls ── */
.db-chart-controls {
  display: flex; gap: 8px;
}
.db-chart-btn {
  padding: 5px 14px; border-radius: 7px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  color: #555; font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer; transition: all 0.18s;
}
.db-chart-btn.active { background: #FFD600; color: #0A0A0A; border-color: #FFD600; font-weight: 700; }

/* ── Chart legend + note ── */
.db-chart-legend {
  display: flex; gap: 18px; margin-top: 12px; font-size: 11px; flex-wrap: wrap;
}
.db-legend-speed { color: #FFD600; }
.db-legend-acc   { color: rgba(80,120,220,0.75); }
.db-legend-avg   { color: #555; }
.db-chart-note { font-size: 11px; color: #444; margin-top: 6px; text-align: center; }

/* ── Words typed ── */
.db-words-typed { text-align: center; padding: 10px 0; }
.db-words-label { display: block; font-size: 11px; color: #444; margin-bottom: 8px; letter-spacing: 0.5px; }
.db-words-val {
  font-family: 'Outfit', sans-serif;
  font-size: 52px; font-weight: 700; color: #d1d0c5;
}

/* ── Stats Grid ── */
.db-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px; overflow: hidden;
  margin-bottom: 14px;
}
.db-stat-cell {
  padding: 22px 24px;
  border-right: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.db-stat-cell-lbl { display: block; font-size: 10px; color: #444; margin-bottom: 8px; letter-spacing: 0.3px; }
.db-stat-cell-val {
  display: block; font-family: 'Outfit', sans-serif;
  font-size: 30px; font-weight: 700; color: #d1d0c5;
}

/* ── Session Table ── */
.db-table-card { padding: 0; overflow: hidden; }
.db-table-scroll { overflow-x: auto; }
.db-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.db-table th {
  padding: 13px 18px; text-align: left;
  color: #444; font-size: 10px; letter-spacing: 0.8px;
  text-transform: lowercase;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  background: rgba(255,255,255,0.02);
  font-weight: 500;
}
.db-table td {
  padding: 12px 18px; color: #d1d0c5;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}
.db-table tr:last-child td { border-bottom: none; }
.db-table tr:hover td { background: rgba(255,255,255,0.02); }
.db-table td:first-child { color: #FFD600; font-weight: 600; }

/* ── Scroll-to-top ── */
.db-scroll-top {
  position: fixed; bottom: 32px; right: 32px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  color: #FFD600; cursor: pointer; font-size: 18px;
  transition: all 0.2s; z-index: 50;
}
.db-scroll-top:hover { background: rgba(255,214,0,0.12); border-color: rgba(255,214,0,0.3); }

@media (max-width: 768px) {
  .db-root { padding: 20px 14px 60px; }
  .db-header-card { flex-direction: column; gap: 16px; padding: 20px; }
  .db-header-stats { gap: 20px; }
  .db-hstat-val { font-size: 20px; }
  .db-bests-cols { gap: 12px; }
  .db-best-col { min-width: 70px; padding: 0 6px; }
  .db-best-col-wpm { font-size: 28px; }
  .db-stats-grid { grid-template-columns: 1fr 1fr; }
  .db-words-val { font-size: 40px; }
  .db-filter-bar { flex-direction: column; align-items: flex-start; }
}
`;

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [progress, setProgress] = useState(null);
  const [daily, setDaily]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    Promise.all([
      apiClient('/analytics/progress?limit=500'),
      apiClient('/analytics/daily'),
    ]).then(([p, d]) => { setProgress(p); setDaily(d); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn, navigate]);

  const filteredHistory = useMemo(() => {
    if (!progress?.history) return [];
    const now = Date.now();
    const cutoff = { week: 7, month: 30, '3months': 90, all: Infinity };
    const ms = (cutoff[timeFilter] || Infinity) * 86400000;
    return progress.history.filter(s => now - new Date(s.created_at).getTime() <= ms);
  }, [progress, timeFilter]);

  const stats = useMemo(() => {
    const h = filteredHistory;
    if (!h.length) return null;
    const wpms = h.map(s => s.wpm);
    const accs = h.map(s => s.accuracy);
    const sum   = arr => arr.reduce((a,b)=>a+b,0);
    return {
      total:    h.length,
      bestWpm:  Math.max(...wpms),
      avgWpm:   sum(wpms)/wpms.length,
      bestAcc:  Math.max(...accs),
      avgAcc:   sum(accs)/accs.length,
      wpmDelta: h.length > 1 ? (h[h.length-1].wpm - h[0].wpm).toFixed(2) : 0,
    };
  }, [filteredHistory]);

  // Personal bests by last N sessions
  const bests = useMemo(() => {
    const all = progress?.history || [];
    const calc = (slice) => {
      if (!slice.length) return { wpm: '—', acc: '—' };
      const wpms = slice.map(s=>s.wpm);
      const accs = slice.map(s=>s.accuracy);
      return {
        wpm: Math.max(...wpms).toFixed(0),
        acc: (accs.reduce((a,b)=>a+b,0)/accs.length).toFixed(0)+'%',
      };
    };
    return [
      { label: 'last 10', ...calc(all.slice(-10)) },
      { label: 'last 25', ...calc(all.slice(-25)) },
      { label: 'last 50', ...calc(all.slice(-50)) },
      { label: 'all time', ...calc(all) },
    ];
  }, [progress]);

  const wordsTyped = useMemo(() => {
    if (!progress) return 0;
    return Math.round(progress.average_wpm * progress.total_time_mins);
  }, [progress]);

  if (loading) return (
    <><style>{DB_STYLES}</style>
    <div className="db-loading">loading your stats…</div></>
  );
  if (error) return (
    <><style>{DB_STYLES}</style>
    <div className="db-error">Failed to load stats: {String(error)}</div></>
  );
  if (!progress) return null;

  const initials = user?.username?.[0]?.toUpperCase() || '?';
  const speedChange = stats ? (parseFloat(stats.wpmDelta) >= 0 ? `+${stats.wpmDelta}` : stats.wpmDelta) : '0';

  return (
    <>
      <style>{DB_STYLES}</style>
      <div className="db-root">

        {/* ── HEADER ── */}
        <div className="db-header-card">
          <div className="db-avatar">{initials}</div>
          <div className="db-user-info">
            <h1 className="db-username">{user?.username}</h1>
            {daily?.date && <p className="db-join-line">{daily.date}</p>}
          </div>
          <div className="db-header-stats">
            <div className="db-hstat">
              <span className="db-hstat-label">tests completed</span>
              <span className="db-hstat-val">{progress.total_sessions}</span>
            </div>
            <div className="db-hstat">
              <span className="db-hstat-label">time typing</span>
              <span className="db-hstat-val">{fmtTime(progress.total_time_mins)}</span>
            </div>
            <div className="db-hstat">
              <span className="db-hstat-label">best wpm</span>
              <span className="db-hstat-val">{progress.best_wpm.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* ── PERSONAL BESTS ── */}
        <div className="db-bests-card">
          <div className="db-bests-mode-label">personal bests</div>
          <div className="db-bests-cols">
            {bests.map(b => (
              <div key={b.label} className="db-best-col">
                <div className="db-best-col-lbl">{b.label}</div>
                <div className="db-best-col-wpm">{b.wpm}</div>
                <div className="db-best-col-acc">{b.acc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── ACTIVITY HEATMAP ── */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">last 12 months · {progress.total_sessions} tests</span>
          </div>
          <ActivityHeatmap history={progress.history} />
          <div className="db-heatmap-legend">
            <span>less</span>
            {[0,'rgba(255,214,0,0.18)','rgba(255,214,0,0.45)','rgba(255,214,0,0.72)','#FFD600'].map((c,i)=>(
              <div key={i} style={{ width:12,height:12,borderRadius:2,background:c||'#1a1a1a' }}/>
            ))}
            <span>more</span>
          </div>
          <div className="db-heatmap-note">Note: All activity data is in UTC time.</div>
        </div>

        {/* ── FILTER BAR ── */}
        <div className="db-filter-bar">
          <div className="db-filter-section">
            {[['week','last week'],['month','last month'],['3months','last 3 months'],['all','all time']].map(([v,lbl])=>(
              <button key={v} className={`db-filter-tab ${timeFilter===v?'active':''}`} onClick={()=>setTimeFilter(v)}>{lbl}</button>
            ))}
          </div>
        </div>

        {/* ── SCATTER PLOT ── */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">wpm over time ({filteredHistory.length} sessions)</span>
          </div>
          <ScatterPlot history={filteredHistory} />
          <div className="db-chart-legend">
            <span className="db-legend-speed">⬤ speed</span>
            <span className="db-legend-acc">⬤ accuracy</span>
            <span className="db-legend-avg">— avg of 10</span>
          </div>
          {stats && (
            <div className="db-chart-note">
              speed change per session: {speedChange} wpm
            </div>
          )}
        </div>

        {/* ── WPM HISTOGRAM ── */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">wpm distribution</span>
          </div>
          <WpmHistogram history={filteredHistory} />
        </div>

        {/* ── DAILY ACTIVITY ── */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">daily sessions (last 30 active days)</span>
          </div>
          <DailyChart history={filteredHistory} />
        </div>

        {/* ── WORDS TYPED ── */}
        <div className="db-card">
          <div className="db-words-typed">
            <span className="db-words-label">estimated words typed</span>
            <span className="db-words-val">{wordsTyped.toLocaleString()}</span>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        {stats && (
          <div className="db-stats-grid">
            {[
              ['tests completed', stats.total],
              ['highest wpm',     progress.best_wpm.toFixed(2)],
              ['average wpm',     stats.avgWpm.toFixed(2)],
              ['highest acc',     `${stats.bestAcc.toFixed(2)}%`],
              ['average acc',     `${stats.avgAcc.toFixed(2)}%`],
              ['time typing',     fmtTime(progress.total_time_mins)],
            ].map(([lbl, val]) => (
              <div key={lbl} className="db-stat-cell">
                <span className="db-stat-cell-lbl">{lbl}</span>
                <span className="db-stat-cell-val">{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── SESSION HISTORY TABLE ── */}
        <div className="db-card db-table-card">
          <div className="db-table-scroll">
            <table className="db-table">
              <thead>
                <tr>
                  <th>wpm</th>
                  <th>accuracy</th>
                  <th>session #</th>
                  <th>date</th>
                </tr>
              </thead>
              <tbody>
                {[...filteredHistory].reverse().slice(0, 50).map((s, i) => (
                  <tr key={i}>
                    <td>{s.wpm.toFixed(2)}</td>
                    <td>{s.accuracy.toFixed(2)}%</td>
                    <td>#{s.session_number}</td>
                    <td>{fmtDate(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Scroll to top */}
      <button className="db-scroll-top" onClick={() => window.scrollTo({top:0,behavior:'smooth'})} title="Back to top">↑</button>
    </>
  );
}
