import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Login from './components/login.jsx'
import Contact from './components/contact.jsx'
import Security from './components/security.jsx'
import Privacy from './components/privacy.jsx'
import TypingTest from './components/TypingTest.jsx'

import { Routes, Route } from "react-router-dom"

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/security" element={<Security />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/typing" element={<TypingTest />} />
      </Routes>
    </>
  )
}

export default App
