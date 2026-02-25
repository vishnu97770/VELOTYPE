import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
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

  let actual_ui;
  if(ui=='login')
  {
    actual_ui = <Login contact_ui_changer={contact_ui_changer} security_ui_changer={security_ui_changer}/>
  }
  else if(ui=='contact')
  {
    actual_ui = <Contact />
  }
  else if(ui=='security')
  {
    actual_ui = <Security />
  }

  return (
    <>
      {actual_ui}
    </>
  )
}

export default App
