import { lazy, Suspense, useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BootScreen from './components/BootScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { LinterPage } from './pages/LinterPage.tsx'
import i18n from './i18n'
import { requestAIWarmup } from './services/aiWorkerClient'
import {
  MODEL_PRESETS,
  suggestDefaultModelId,
  type ModelPresetId,
} from './services/aiScenarioGenerator'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

function shouldAutoWarmup(): boolean {
  if (typeof window === 'undefined') return false

  const params = new URLSearchParams(window.location.search)
  const warmupOverride = params.get('aiWarmup')
  if (warmupOverride === 'false') return false
  if (warmupOverride === 'true') return true

  const ua = navigator.userAgent
  const isAppleMobile = /iPhone|iPad|iPod/i.test(ua)
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4

  // iOS browsers and low-resource devices are prone to tab eviction during
  // background model warmup. Keep startup lightweight and warm only on demand.
  return !isAppleMobile && mem > 4 && cores > 4
}

export function Root() {
  const [boot, setBoot] = useState(() => {
    return new URLSearchParams(window.location.search).get('boot') === 'false'
  })

  useEffect(() => {
    if (boot) return
    if (!shouldAutoWarmup()) return

    const queryModel = new URLSearchParams(window.location.search).get('model')
    const modelId: ModelPresetId =
      queryModel && queryModel in MODEL_PRESETS
        ? (queryModel as ModelPresetId)
        : suggestDefaultModelId()

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
