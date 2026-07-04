import { useState } from 'react'
import App from './App.tsx'
import BootScreen from './components/BootScreen.tsx'

export function Root() {
  const [booted, setBooted] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') !== 'true'
  })

  if (!booted) {
    return <BootScreen onComplete={() => setBooted(true)} />
  }

  return <App />
}

export default Root
