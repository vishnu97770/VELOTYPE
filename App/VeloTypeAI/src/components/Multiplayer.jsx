import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../apiClient';

// Derive WebSocket base from the same env var as apiClient
const _apiBase = import.meta.env.VITE_API_URL || 'https://velotype-2-jn34.onrender.com/api/v1';
const WS_BASE  = _apiBase.replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws').replace('/api/v1', '');

const RANK_META = {
  'Bronze':          { color: '#cd7f32', glow: 'rgba(205,127,50,0.5)',  min: 0    },
  'Silver':          { color: '#c0c0c0', glow: 'rgba(192,192,192,0.5)', min: 1000 },
  'Gold':            { color: '#FFD600', glow: 'rgba(255,214,0,0.5)',   min: 1500 },
  'Platinum':        { color: '#00e5cc', glow: 'rgba(0,229,204,0.5)',   min: 2000 },
  'Diamond':         { color: '#4fc3f7', glow: 'rgba(79,195,247,0.5)',  min: 2500 },
  'Immortal':        { color: '#ba68c8', glow: 'rgba(186,104,200,0.5)', min: 3000 },
  'Velotype Master': { color: '#ff4444', glow: 'rgba(255,68,68,0.5)',   min: 3500 },
};

function getRank(elo) {
  if (elo >= 3500) return 'Velotype Master';
  if (elo >= 3000) return 'Immortal';
  if (elo >= 2500) return 'Diamond';
  if (elo >= 2000) return 'Platinum';
  if (elo >= 1500) return 'Gold';
  if (elo >= 1000) return 'Silver';
  return 'Bronze';
}

function RankBadge({ elo, size = 12 }) {
  const rank = getRank(elo);
  const meta = RANK_META[rank];
  return (
    <span style={{
      fontSize: size,
      fontWeight: 700,
      color: meta.color,
      textShadow: `0 0 8px ${meta.glow}`,
      fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: 0.5,
    }}>
      {rank}
    </span>
  );
}

const CSS = `
.mp-page {
  min-height: 100vh;
  background: #0A0A0A;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 60px 40px 100px;
  font-family: 'Outfit', sans-serif;
  color: #e2e2e2;
}
.mp-title {
  font-size: clamp(36px,5vw,60px);
  font-weight: 900;
  color: #fff;
  letter-spacing: -1px;
  margin-bottom: 10px;
  text-align: center;
}
.mp-title span { color: #FFD600; text-shadow: 0 0 24px rgba(255,214,0,0.5); }
.mp-subtitle {
  color: #555;
  font-size: 17px;
  margin-bottom: 56px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Lobby ── */
.mp-lobby {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  max-width: 1000px;
}
.mp-card {
  flex: 1;
  min-width: 340px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,214,0,0.1);
  border-radius: 18px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mp-card h2 {
  font-size: 26px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}
.mp-card p {
  font-size: 15px;
  color: #555;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
}
.mp-input {
  width: 100%;
  padding: 14px 20px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,214,0,0.2);
  border-radius: 12px;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 4px;
  text-transform: uppercase;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.mp-input:focus {
  border-color: rgba(255,214,0,0.5);
  box-shadow: 0 0 0 3px rgba(255,214,0,0.08);
}
.mp-btn {
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 800;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  font-family: 'Outfit', sans-serif;
}
.mp-btn-primary {
  background: #FFD600;
  color: #0A0A0A;
  box-shadow: 0 4px 20px rgba(255,214,0,0.3);
}
.mp-btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 28px rgba(255,214,0,0.45);
}
.mp-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.mp-btn-outline {
  background: transparent;
  color: #888;
  border: 1px solid rgba(255,255,255,0.1);
}
.mp-btn-outline:hover { color: #fff; border-color: rgba(255,255,255,0.25); }
.mp-error {
  color: #ca4754;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  margin-top: -8px;
}

/* ── Room Options ── */
.mp-options-label {
  font-size: 13px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-family: 'JetBrains Mono', monospace;
  margin-bottom: 10px;
}
.mp-options-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.mp-opt-btn {
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.04);
  color: #888;
  font-size: 15px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.2s;
}
.mp-opt-btn:hover { border-color: rgba(255,214,0,0.3); color: #FFD600; }
.mp-opt-btn.active {
  background: rgba(255,214,0,0.12);
  border-color: rgba(255,214,0,0.5);
  color: #FFD600;
  font-weight: 700;
}
.mp-opt-btn.diff-easy.active   { background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.5); color: #4ade80; }
.mp-opt-btn.diff-medium.active { background: rgba(255,214,0,0.12);  border-color: rgba(255,214,0,0.5);  color: #FFD600; }
.mp-opt-btn.diff-hard.active   { background: rgba(248,113,113,0.12); border-color: rgba(248,113,113,0.5); color: #f87171; }
.mp-opt-btn.toggle.active      { background: rgba(167,139,250,0.15); border-color: rgba(167,139,250,0.5); color: #a78bfa; }
.mp-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }

/* ── Waiting room ── */
.mp-waiting {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.mp-room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
.mp-room-code-box {
  background: rgba(255,214,0,0.07);
  border: 1px solid rgba(255,214,0,0.25);
  border-radius: 12px;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mp-room-code-label { font-size: 11px; color: #555; font-family: 'JetBrains Mono', monospace; text-transform: uppercase; }
.mp-room-code-val {
  font-size: 28px;
  font-weight: 900;
  color: #FFD600;
  letter-spacing: 6px;
  font-family: 'JetBrains Mono', monospace;
  text-shadow: 0 0 20px rgba(255,214,0,0.4);
}
.mp-player-list {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
}
.mp-player-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  transition: background 0.15s;
}
.mp-player-item:last-child { border-bottom: none; }
.mp-player-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,214,0,0.15);
  border: 1px solid rgba(255,214,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: #FFD600;
  flex-shrink: 0;
}
.mp-player-name { font-size: 15px; font-weight: 700; flex: 1; }
.mp-host-tag {
  font-size: 10px;
  font-weight: 700;
  color: #FFD600;
  background: rgba(255,214,0,0.1);
  border: 1px solid rgba(255,214,0,0.25);
  padding: 2px 8px;
  border-radius: 20px;
  font-family: 'JetBrains Mono', monospace;
  text-transform: uppercase;
}
.mp-waiting-pulse {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #555;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
}
.mp-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #FFD600;
  animation: mp-blink 1.2s ease-in-out infinite;
}
.mp-dot:nth-child(2) { animation-delay: 0.2s; }
.mp-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes mp-blink {
  0%,100% { opacity: 0.2; }
  50%      { opacity: 1; }
}

/* ── Countdown ── */
.mp-countdown {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 300px;
}
.mp-count-num {
  font-size: 140px;
  font-weight: 900;
  color: #FFD600;
  line-height: 1;
  text-shadow: 0 0 60px rgba(255,214,0,0.6);
  animation: mp-countPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275);
}
@keyframes mp-countPop {
  0%  { transform: scale(0.6); opacity: 0; }
  100%{ transform: scale(1);   opacity: 1; }
}
.mp-count-label { font-size: 18px; color: #555; letter-spacing: 4px; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }

/* ── Race ── */
.mp-race {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mp-race-stats {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.mp-stat-pill {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  padding: 10px 18px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mp-stat-pill label { font-size: 10px; color: #555; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
.mp-stat-pill span  { font-size: 22px; font-weight: 800; color: #FFD600; }
.mp-prompt-box {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 14px;
  padding: 28px 32px;
  font-size: 20px;
  line-height: 1.8;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  cursor: text;
  position: relative;
  min-height: 100px;
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  overflow: hidden;
}
.mp-char-correct { color: #4ade80; }
.mp-char-wrong   { color: #f87171; background: rgba(248,113,113,0.15); border-radius: 2px; }
.mp-char-cursor  {
  color: #0A0A0A;
  background: #FFD600;
  border-radius: 2px;
  animation: mp-cursor-blink 1s step-end infinite;
}
.mp-char-untyped { color: rgba(255,255,255,0.25); }
@keyframes mp-cursor-blink { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
.mp-hidden-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 1px;
  height: 1px;
}
.mp-progress-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.mp-progress-label { font-size: 12px; color: #555; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; letter-spacing: 1px; }
.mp-player-track {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mp-track-name {
  width: 110px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}
.mp-track-me { color: #FFD600; }
.mp-track-bar-bg {
  flex: 1;
  height: 8px;
  background: rgba(255,255,255,0.06);
  border-radius: 99px;
  overflow: hidden;
}
.mp-track-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}
.mp-track-wpm {
  width: 52px;
  font-size: 12px;
  color: #555;
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  flex-shrink: 0;
}
.mp-pos-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: 'JetBrains Mono', monospace;
}

/* ── Results ── */
.mp-results { width: 100%; max-width: 680px; }
.mp-results-title {
  font-size: 32px;
  font-weight: 900;
  color: #fff;
  margin-bottom: 24px;
  text-align: center;
}
.mp-results-title span { color: #FFD600; }
.mp-result-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}
.mp-result-row.mp-result-me { border-color: rgba(255,214,0,0.25); background: rgba(255,214,0,0.04); }
.mp-result-pos {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.mp-result-pos.pos-1 { background: #FFD600; color: #0A0A0A; }
.mp-result-pos.pos-2 { background: #c0c0c0; color: #0A0A0A; }
.mp-result-pos.pos-3 { background: #cd7f32; color: #0A0A0A; }
.mp-result-pos.pos-other { background: rgba(255,255,255,0.08); color: #555; }
.mp-result-user { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.mp-result-username { font-size: 16px; font-weight: 700; }
.mp-result-stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #555;
  font-family: 'JetBrains Mono', monospace;
}
.mp-elo-change {
  font-size: 18px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
}
.mp-elo-up   { color: #4ade80; }
.mp-elo-down { color: #f87171; }
.mp-result-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: center;
  flex-wrap: wrap;
}
`;

export default function Multiplayer() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase]         = useState('lobby');   // lobby|waiting|countdown|racing|results
  const [roomCode, setRoomCode]   = useState('');
  const [joinCode, setJoinCode]   = useState('');
  const [players, setPlayers]     = useState([]);
  const [hostId, setHostId]       = useState('');
  const [hostUsername, setHU]     = useState('');
  const [countdown, setCountdown] = useState(3);
  const [prompt, setPrompt]       = useState('');
  const [typed, setTyped]         = useState('');
  const [startTime, setStartTime] = useState(null);
  const [currentWpm, setWpm]      = useState(0);
  const [currentAcc, setAcc]      = useState(100);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // ── Room creation options ──
  const [difficulty,       setDifficulty]       = useState('medium');
  const [wordCount,        setWordCount]         = useState(50);
  const [maxPlayers,       setMaxPlayers]        = useState(6);
  const [customPlayers,    setCustomPlayers]     = useState('');
  const [showCustomPlayers,setShowCustomPlayers] = useState(false);
  const [withPunctuation,  setWithPunctuation]   = useState(false);
  const [withNumbers,      setWithNumbers]       = useState(false);
  const [withQuotes,       setWithQuotes]        = useState(false);

  const wsRef            = useRef(null);
  const inputRef         = useRef(null);
  const progressTimerRef = useRef(null);
  const typedRef         = useRef('');
  const startTimeRef     = useRef(null);
  const finishedRef      = useRef(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  const myId = user?.user_id || '';

  // ── WebSocket connection ──
  const connectWs = useCallback((code) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const ws = new WebSocket(`${WS_BASE}/api/v1/rooms/${code}/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);

      if (msg.type === 'room_state') {
        setPlayers(msg.players || []);
        setHostId(msg.host_id || '');
        setHU(msg.host_username || '');
        if (msg.status === 'waiting') setPhase('waiting');
        if (msg.prompt)               setPrompt(msg.prompt);
      }
      else if (msg.type === 'countdown') {
        setPhase('countdown');
        setCountdown(msg.count);
      }
      else if (msg.type === 'race_start') {
        setPrompt(msg.prompt);
        setTyped('');
        typedRef.current  = '';
        finishedRef.current = false;
        setStartTime(null);
        startTimeRef.current = null;
        setPhase('racing');
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      else if (msg.type === 'player_progress') {
        setPlayers(msg.players || []);
      }
      else if (msg.type === 'race_results') {
        clearInterval(progressTimerRef.current);
        setResults(msg.results || []);
        setPhase('results');
      }
    };

    ws.onclose = () => {};
  }, []);

  const disconnectWs = useCallback(() => {
    clearInterval(progressTimerRef.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  // ── Start progress sender when racing begins ──
  useEffect(() => {
    if (phase !== 'racing') return;
    progressTimerRef.current = setInterval(() => {
      const t = typedRef.current;
      const p = prompt ? (t.length / prompt.length) * 100 : 0;
      const elapsed = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0;
      const wpm = elapsed > 0 ? Math.round((t.length / 5) / elapsed) : 0;
      let correct = 0;
      for (let i = 0; i < t.length; i++) if (t[i] === prompt[i]) correct++;
      const acc = t.length > 0 ? Math.round((correct / t.length) * 100) : 100;
      wsRef.current?.send(JSON.stringify({ type: 'progress_update', progress: p, wpm, accuracy: acc }));
    }, 400);
    return () => clearInterval(progressTimerRef.current);
  }, [phase, prompt]);

  // ── Typing handler ──
  const handleTyping = useCallback((e) => {
    if (phase !== 'racing' || finishedRef.current) return;
    const val = e.target.value;

    if (!startTimeRef.current && val.length > 0) {
      startTimeRef.current = Date.now();
      setStartTime(startTimeRef.current);
    }

    setTyped(val);
    typedRef.current = val;

    // Compute live stats
    const elapsed = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0;
    const wpm = elapsed > 0 ? Math.round((val.length / 5) / elapsed) : 0;
    let correct = 0;
    for (let i = 0; i < val.length; i++) if (val[i] === prompt[i]) correct++;
    const acc = val.length > 0 ? Math.round((correct / val.length) * 100) : 100;
    setWpm(wpm);
    setAcc(acc);

    // Check completion
    if (val.length >= prompt.length && !finishedRef.current) {
      finishedRef.current = true;
      clearInterval(progressTimerRef.current);
      wsRef.current?.send(JSON.stringify({ type: 'finished', wpm, accuracy: acc }));
    }
  }, [phase, prompt]);

  // ── Create room ──
  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient('/rooms', {
        method: 'POST',
        body: JSON.stringify({
          difficulty,
          word_count:       wordCount,
          max_players:      maxPlayers,
          with_punctuation: withPunctuation,
          with_numbers:     withNumbers,
          with_quotes:      withQuotes,
        }),
      });
      setRoomCode(res.room_code);
      setPhase('waiting');
      connectWs(res.room_code);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Join room ──
  const handleJoin = async () => {
    if (joinCode.length < 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await apiClient('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ room_code: joinCode.trim().toUpperCase() }),
      });
      setRoomCode(res.room_code);
      setPhase('waiting');
      connectWs(res.room_code);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Leave room ──
  const handleLeave = () => {
    disconnectWs();
    setPhase('lobby');
    setRoomCode('');
    setPlayers([]);
    setTyped('');
    typedRef.current = '';
    finishedRef.current = false;
    setResults([]);
    setError('');
  };

  // ── Start race (host only) ──
  const handleStart = () => {
    wsRef.current?.send(JSON.stringify({ type: 'start_race' }));
  };

  // ── Copy room code ──
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode).catch(() => {});
  };

  // Cleanup on unmount
  useEffect(() => () => disconnectWs(), [disconnectWs]);

  // ── Position badge colors ──
  const posStyle = (pos) => {
    if (pos === 1) return { background: '#FFD600', color: '#0A0A0A' };
    if (pos === 2) return { background: '#c0c0c0', color: '#0A0A0A' };
    if (pos === 3) return { background: '#cd7f32', color: '#0A0A0A' };
    return { background: 'rgba(255,255,255,0.08)', color: '#555' };
  };

  // ── Player track bar color by position ──
  const trackColor = (p, isMe) => {
    if (isMe) return '#FFD600';
    const hue = 180 + (players.indexOf(p) * 40);
    return `hsl(${hue},70%,55%)`;
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="mp-page">
        <h1 className="mp-title">Velo<span>Race</span></h1>
        <p className="mp-subtitle">Compete in real-time typing battles — climb the ELO ladder</p>

        {/* ── LOBBY ── */}
        {phase === 'lobby' && (
          <div className="mp-lobby">
            <div className="mp-card">
              <h2>Create Room</h2>
              <p>Customize your race then invite friends via a 6-digit code.</p>

              <div className="mp-divider" />

              {/* Difficulty */}
              <div>
                <p className="mp-options-label">Difficulty</p>
                <div className="mp-options-row">
                  {['easy','medium','hard'].map(d => (
                    <button key={d}
                      className={`mp-opt-btn diff-${d} ${difficulty === d ? 'active' : ''}`}
                      onClick={() => setDifficulty(d)}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Word Count */}
              <div>
                <p className="mp-options-label">Word Count</p>
                <div className="mp-options-row">
                  {[25, 50, 75, 100].map(w => (
                    <button key={w}
                      className={`mp-opt-btn ${wordCount === w ? 'active' : ''}`}
                      onClick={() => setWordCount(w)}>
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Players */}
              <div>
                <p className="mp-options-label">Max Players</p>
                <div className="mp-options-row">
                  {[2, 3, 4, 5, 6].map(n => (
                    <button key={n}
                      className={`mp-opt-btn ${maxPlayers === n && !showCustomPlayers ? 'active' : ''}`}
                      onClick={() => { setMaxPlayers(n); setShowCustomPlayers(false); setCustomPlayers(''); }}>
                      {n}
                    </button>
                  ))}
                  <button
                    className={`mp-opt-btn toggle ${showCustomPlayers ? 'active' : ''}`}
                    onClick={() => setShowCustomPlayers(v => !v)}>
                    custom
                  </button>
                  {showCustomPlayers && (
                    <input
                      type="number"
                      min="2"
                      max="20"
                      placeholder="e.g. 8"
                      value={customPlayers}
                      onChange={e => {
                        setCustomPlayers(e.target.value);
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 2) setMaxPlayers(val);
                      }}
                      style={{
                        width: '72px',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(167,139,250,0.5)',
                        background: 'rgba(167,139,250,0.1)',
                        color: '#a78bfa',
                        fontSize: '13px',
                        fontFamily: "'JetBrains Mono', monospace",
                        outline: 'none',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Content Toggles */}
              <div>
                <p className="mp-options-label">Include</p>
                <div className="mp-options-row">
                  <button
                    className={`mp-opt-btn toggle ${withPunctuation ? 'active' : ''}`}
                    onClick={() => setWithPunctuation(v => !v)}>
                    punct
                  </button>
                  <button
                    className={`mp-opt-btn toggle ${withNumbers ? 'active' : ''}`}
                    onClick={() => setWithNumbers(v => !v)}>
                    numbers
                  </button>
                  <button
                    className={`mp-opt-btn toggle ${withQuotes ? 'active' : ''}`}
                    onClick={() => setWithQuotes(v => !v)}>
                    quotes
                  </button>
                </div>
              </div>

              <div className="mp-divider" />

              {error && <p className="mp-error">{error}</p>}
              <button
                className="mp-btn mp-btn-primary"
                onClick={handleCreate}
                disabled={loading}>
                {loading ? 'Creating…' : '+ Create Room'}
              </button>
            </div>

            <div className="mp-card">
              <h2>Join Room</h2>
              <p>Enter a 6-character room code to join an existing race.</p>
              <input
                className="mp-input"
                placeholder="ABC123"
                maxLength={6}
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
              />
              {error && <p className="mp-error">{error}</p>}
              <button
                className="mp-btn mp-btn-primary"
                onClick={handleJoin}
                disabled={loading || joinCode.length < 6}
              >
                {loading ? 'Joining…' : 'Join →'}
              </button>
            </div>
          </div>
        )}

        {/* ── WAITING ROOM ── */}
        {phase === 'waiting' && (
          <div className="mp-waiting">
            <div className="mp-room-header">
              <div className="mp-room-code-box">
                <span className="mp-room-code-label">Room code — share this</span>
                <span
                  className="mp-room-code-val"
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                  onClick={copyCode}
                >
                  {roomCode}
                </span>
              </div>
              <button className="mp-btn mp-btn-outline" onClick={handleLeave}>Leave</button>
            </div>

            <div className="mp-player-list">
              {players.map(p => (
                <div key={p.user_id} className="mp-player-item">
                  <div className="mp-player-avatar">{p.username[0].toUpperCase()}</div>
                  <span className="mp-player-name">{p.username}</span>
                  <RankBadge elo={p.elo || 1000} size={11} />
                  {p.user_id === hostId && <span className="mp-host-tag">Host</span>}
                </div>
              ))}
            </div>

            {String(myId) === hostId ? (
              <button
                className="mp-btn mp-btn-primary"
                onClick={handleStart}
                disabled={players.length < 1}
              >
                Start Race →
              </button>
            ) : (
              <div className="mp-waiting-pulse">
                <div className="mp-dot" />
                <div className="mp-dot" />
                <div className="mp-dot" />
                <span>Waiting for host to start the race…</span>
              </div>
            )}
          </div>
        )}

        {/* ── COUNTDOWN ── */}
        {phase === 'countdown' && (
          <div className="mp-countdown">
            <div className="mp-count-num" key={countdown}>{countdown}</div>
            <p className="mp-count-label">Get ready…</p>
          </div>
        )}

        {/* ── RACING ── */}
        {phase === 'racing' && (
          <div className="mp-race">
            {/* Live stats */}
            <div className="mp-race-stats">
              <div className="mp-stat-pill">
                <label>WPM</label>
                <span>{currentWpm}</span>
              </div>
              <div className="mp-stat-pill">
                <label>Accuracy</label>
                <span>{currentAcc}%</span>
              </div>
              <div className="mp-stat-pill">
                <label>Progress</label>
                <span>{prompt ? Math.round((typed.length / prompt.length) * 100) : 0}%</span>
              </div>
            </div>

            {/* Prompt text */}
            <div
              className="mp-prompt-box"
              onClick={() => inputRef.current?.focus()}
            >
              {prompt.split('').map((ch, i) => {
                let cls = 'mp-char-untyped';
                if (i < typed.length)      cls = typed[i] === ch ? 'mp-char-correct' : 'mp-char-wrong';
                else if (i === typed.length) cls = 'mp-char-cursor';
                return (
                  <span key={i} className={cls}>
                    {ch === ' ' ? ' ' : ch}
                  </span>
                );
              })}
              <input
                ref={inputRef}
                className="mp-hidden-input"
                value={typed}
                onChange={handleTyping}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
              />
            </div>

            {/* Player progress bars */}
            <div className="mp-progress-section">
              <span className="mp-progress-label">Live standings</span>
              {[...players]
                .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                .map((p, idx) => {
                  const isMe = String(p.user_id) === String(myId);
                  const color = isMe ? '#FFD600' : `hsl(${180 + idx * 50},65%,55%)`;
                  const pos = p.finish_position;
                  return (
                    <div key={p.user_id} className="mp-player-track">
                      <div
                        className="mp-pos-badge"
                        style={pos ? posStyle(pos) : { background: 'rgba(255,255,255,0.05)', color: '#444' }}
                      >
                        {pos || idx + 1}
                      </div>
                      <span className={`mp-track-name${isMe ? ' mp-track-me' : ''}`}>
                        {p.username}
                      </span>
                      <div className="mp-track-bar-bg">
                        <div
                          className="mp-track-bar-fill"
                          style={{ width: `${p.progress || 0}%`, background: color }}
                        />
                      </div>
                      <span className="mp-track-wpm">{p.wpm > 0 ? `${Math.round(p.wpm)} wpm` : ''}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {phase === 'results' && (
          <div className="mp-results">
            <h2 className="mp-results-title">Race <span>Results</span></h2>
            {results.map(r => {
              const isMe = String(r.user_id) === String(myId);
              const pos = r.finish_position;
              const posClass = pos === 1 ? 'pos-1' : pos === 2 ? 'pos-2' : pos === 3 ? 'pos-3' : 'pos-other';
              return (
                <div key={r.user_id} className={`mp-result-row${isMe ? ' mp-result-me' : ''}`}>
                  <div className={`mp-result-pos ${posClass}`}>{pos}</div>
                  <div className="mp-result-user">
                    <span className="mp-result-username">
                      {r.username}
                      {isMe && <span style={{ color: '#FFD600', fontSize: 12, marginLeft: 8 }}>you</span>}
                    </span>
                    <div className="mp-result-stats">
                      <span>{Math.round(r.wpm)} wpm</span>
                      <span>{Math.round(r.accuracy)}% acc</span>
                      <RankBadge elo={r.new_elo || 1000} size={11} />
                    </div>
                  </div>
                  <span className={`mp-elo-change ${r.elo_change >= 0 ? 'mp-elo-up' : 'mp-elo-down'}`}>
                    {r.elo_change >= 0 ? '+' : ''}{r.elo_change}
                  </span>
                </div>
              );
            })}
            <div className="mp-result-actions">
              <button className="mp-btn mp-btn-primary" onClick={handleLeave}>
                Play Again
              </button>
              <button className="mp-btn mp-btn-outline" onClick={() => navigate('/leaderboard')}>
                Leaderboard →
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
