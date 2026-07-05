import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import BootScreen from './components/BootScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { LinterPage } from './pages/LinterPage.tsx'
import i18n from './i18n'
import {
  readAIStatusSnapshot,
  requestAIWarmup,
  subscribeAIStatus,
  type AIStatusSnapshot,
} from './services/aiWorkerClient'
import {
  MODEL_PRESETS,
  suggestDefaultModelId,
  type ModelPresetId,
} from './services/aiScenarioGenerator'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

const DEBUG_TRACE_KEY = 'culture-lint:debug-trace'

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
  const isDebugVisible = useMemo(
    () => new URLSearchParams(window.location.search).get('debug') === '1',
    []
  )
  const [debugTrace, setDebugTrace] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      return JSON.parse(window.sessionStorage.getItem(DEBUG_TRACE_KEY) ?? '[]') as string[]
    } catch {
      return []
    }
  })
  const [aiStatus, setAIStatus] = useState<AIStatusSnapshot | null>(() => readAIStatusSnapshot())

  useEffect(() => {
    if (!isDebugVisible) return

    const syncTrace = () => {
      try {
        setDebugTrace(JSON.parse(window.sessionStorage.getItem(DEBUG_TRACE_KEY) ?? '[]') as string[])
      } catch {
        setDebugTrace([])
      }
    }

    syncTrace()
    window.addEventListener('culture-lint-debug-trace', syncTrace)
    window.addEventListener('storage', syncTrace)

    return () => {
      window.removeEventListener('culture-lint-debug-trace', syncTrace)
      window.removeEventListener('storage', syncTrace)
    }
  }, [isDebugVisible])

  useEffect(() => {
    return subscribeAIStatus(() => {
      setAIStatus(readAIStatusSnapshot())
    })
  }, [])

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
      {isDebugVisible && (
        <div className="fixed left-3 right-3 top-3 z-[60] max-h-[40vh] overflow-auto rounded-lg border border-amber-400/30 bg-black/85 p-3 font-mono text-[11px] text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.18)] backdrop-blur-sm">
          <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-amber-300">
            Debug trace
          </div>
          <div className="space-y-1">
            {debugTrace.length > 0 ? (
              debugTrace.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)
            ) : (
              <div>No trace yet.</div>
            )}
          </div>
        </div>
      )}
      {aiStatus && aiStatus.kind !== 'idle' && (
        <div className="fixed bottom-3 left-3 right-3 z-[65] rounded-xl border border-cyan-400/25 bg-black/80 px-3 py-2.5 font-mono text-[11px] text-cyan-100 shadow-[0_0_22px_rgba(0,240,255,0.16)] backdrop-blur-sm sm:left-auto sm:right-3 sm:max-w-md">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.18em] text-cyan-300">
                AI loading monitor
              </div>
              <div className="mt-1 truncate text-slate-200">
                {aiStatus.modelId ?? 'unknown model'} · {aiStatus.phase ?? 'starting'}
              </div>
            </div>
            <div className="shrink-0 text-cyan-300">{aiStatus.percent ?? 0}%</div>
          </div>
          {aiStatus.label && <div className="mt-1.5 text-slate-300">{aiStatus.label}</div>}
          {aiStatus.message && <div className="mt-1.5 text-amber-300">{aiStatus.message}</div>}
        </div>
      )}
      {!boot && <BootScreen onComplete={() => setBoot(true)} />}
    </>
  )
}

export default Root
