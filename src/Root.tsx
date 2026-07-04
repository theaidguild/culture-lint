import { useState } from 'react'
import App from './App.tsx'
import BootScreen from './components/BootScreen.tsx'

export function Root() {
  const [boot, setBoot] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') === 'false'
  })

  if (!boot) {
    return <BootScreen onComplete={() => setBoot(true)} />
  }

  return <App />
}

export default Root
