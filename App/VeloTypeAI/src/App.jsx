import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Login from './components/login.jsx'
import Contact from './components/contact.jsx'
import Security from './components/security.jsx'

function App() {
  const [ui, setUI] = useState('login');

  function contact_ui_changer()
  {
      setUI((oldUI) => 'contact');
  }
  function security_ui_changer()
  {
    setUI((oldUI) => 'security');
  }

  
  return (
    <>
      {ui=="login"? <Login contact_ui_changer={contact_ui_changer} security_ui_changer={security_ui_changer}/> : null}
      {ui=="contact"? <Contact /> : null}
      {ui=="security"? <Security /> : null}
    </>
  )
}

export default App
