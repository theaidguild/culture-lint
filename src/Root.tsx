import { useState } from 'react'
import App from './App.tsx'
import BootScreen from './components/BootScreen.tsx'

export function Root() {
  const [boot, setBoot] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') === 'false'
  })

  return (
    <>
      <App />
      {!boot && <BootScreen onComplete={() => setBoot(true)} />}
    </>
  )
}

export default Root
