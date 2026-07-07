import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import './i18n'
import { router } from './router'

const SPA_REDIRECT_KEY = 'culture-lint:spa-redirect'
const DEBUG_TRACE_KEY = 'culture-lint:debug-trace'

function pushDebugTrace(message: string) {
  if (typeof window === 'undefined') return

  const entry = `${new Date().toISOString()} ${message}`
  try {
    const current = JSON.parse(window.sessionStorage.getItem(DEBUG_TRACE_KEY) ?? '[]') as string[]
    current.push(entry)
    window.sessionStorage.setItem(DEBUG_TRACE_KEY, JSON.stringify(current.slice(-40)))
    window.dispatchEvent(new Event('culture-lint-debug-trace'))
  } catch {
    // Ignore storage issues; best-effort diagnostics only.
  }
}

function restoreSpaRoute() {
  if (typeof window === 'undefined') return

  const base = import.meta.env.BASE_URL
  const redirectedPath = window.sessionStorage.getItem(SPA_REDIRECT_KEY)
  if (!redirectedPath) return

  window.sessionStorage.removeItem(SPA_REDIRECT_KEY)

  const isAtBaseRoot =
    window.location.pathname === base || window.location.pathname === `${base}index.html`

  if (!isAtBaseRoot) return

  window.history.replaceState(null, '', `${base}${redirectedPath}`)
}

if (typeof window !== 'undefined') {
  pushDebugTrace(`boot ${window.location.pathname}${window.location.search}`)

  window.addEventListener('error', (event) => {
    const error = event.error instanceof Error ? event.error.message : event.message
    pushDebugTrace(`window.error ${error || 'unknown-error'}`)
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason)
    pushDebugTrace(`unhandledrejection ${reason}`)
  })
}

restoreSpaRoute()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
