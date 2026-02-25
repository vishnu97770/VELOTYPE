import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import Login from './components/login.jsx'
import Contact from './components/contact.jsx'

function App() {
  const [ui, setUI] = useState('login');

  function contact_ui_changer()
  {
      setUI((oldUI) => 'contact');
  }

  let actual_ui;
  if(ui=='login')
  {
    actual_ui = <Login contact_ui_changer={contact_ui_changer}/>
  }
  else if(ui=='contact')
  {
    actual_ui = <Contact />
  }
  return (
    <>
      {actual_ui}
    </>
  )
}

export default App
