import { useState } from 'react'
import Login from './components/login.jsx'
import Contact from './components/contact.jsx'
import Security from './components/security.jsx'
import Privacy from './components/privacy.jsx'
import TypingTest from './components/TypingTest.jsx'
import Landing from './components/Landing.jsx'
import Dashboard from './components/Dashboard.jsx'
import Navbar from './components/Navbar.jsx'

import { Routes, Route, useLocation } from "react-router-dom"

function App() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/type" element={<TypingTest />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/security" element={<Security />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
