import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BootScreen from './components/BootScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { LinterPage } from './pages/LinterPage.tsx'
import i18n from './i18n'
import { requestAIWarmup } from './services/aiWorkerClient'
import type { ModelPresetId } from './services/aiScenarioGenerator'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

export function Root() {
  const [boot, setBoot] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') === 'false'
  })

  useEffect(() => {
    if (boot) return

    const queryModel = new URLSearchParams(window.location.search).get(
      'model'
    ) as ModelPresetId | null
    const modelId: ModelPresetId = queryModel === 'qwen25' ? 'qwen25' : 'smollm2'

    void requestAIWarmup({
      modelId,
      language: i18n.language as 'en-US' | 'pt-BR',
    }).catch(() => {
      // Boot prewarm is best-effort only.
    })
  }, [boot])

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
