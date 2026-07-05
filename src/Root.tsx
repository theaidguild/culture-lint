import { lazy, Suspense, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BootScreen from './components/BootScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { LinterPage } from './pages/LinterPage.tsx'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

export function Root() {
  const [boot, setBoot] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') === 'false'
  })

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LinterPage />} />
          <Route
            path="ai"
            element={
              <Suspense fallback={null}>
                <AIPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      {!boot && <BootScreen onComplete={() => setBoot(true)} />}
    </>
  )
}

export default Root
