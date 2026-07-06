import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Navigate, Route, Routes } from 'react-router-dom'
import BootScreen from './components/BootScreen.tsx'
import { Layout } from './components/Layout.tsx'
import { LinterPage } from './pages/LinterPage.tsx'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

const DEBUG_TRACE_KEY = 'culture-lint:debug-trace'

export function Root() {
  const { t } = useTranslation()
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
            {t('debug.traceTitle')}
          </div>
          <div className="space-y-1">
            {debugTrace.length > 0 ? (
              debugTrace.map((line, index) => <div key={`${line}-${index}`}>{line}</div>)
            ) : (
              <div>{t('debug.noTrace')}</div>
            )}
          </div>
        </div>
      )}
      {!boot && <BootScreen onComplete={() => setBoot(true)} />}
    </>
  )
}

export default Root
