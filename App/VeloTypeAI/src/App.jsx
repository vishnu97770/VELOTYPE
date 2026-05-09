import Login from './components/login.jsx'
import Contact from './components/contact.jsx'
import Security from './components/security.jsx'
import Privacy from './components/privacy.jsx'
import TypingTest from './components/TypingTest.jsx'
import Landing from './components/Landing.jsx'
import Dashboard from './components/Dashboard.jsx'
import Multiplayer from './components/Multiplayer.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Navbar from './components/Navbar.jsx'
import FloatingParticles from './components/FloatingParticles.jsx'

import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {/* Global ambient particle layer — sits at z-index:1, behind all page content */}
      <FloatingParticles />

      {/* Page content wrapper at z-index:2 ensures it renders above the canvas */}
      <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/type" element={<TypingTest />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/multiplayer" element={<Multiplayer />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/security" element={<Security />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </>
  )
}

export default App
