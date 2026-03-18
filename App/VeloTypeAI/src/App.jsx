import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Login from './components/login.jsx'
import Contact from './components/contact.jsx'
import Security from './components/security.jsx'

import { Routes, Route } from "react-router-dom"

function App() {
  <Routes>
      <Route path="/" element={<Login/>} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/security" element={<Security />} />
  </Routes>
}

export default App
