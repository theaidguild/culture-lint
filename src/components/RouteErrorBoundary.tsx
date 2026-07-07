import { useEffect } from 'react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

const DEBUG_TRACE_KEY = 'culture-lint:debug-trace'

function resolveErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

function pushDebugTrace(message: string) {
  if (typeof window === 'undefined') return

  const entry = `${new Date().toISOString()} ${message}`
  try {
    const current = JSON.parse(window.sessionStorage.getItem(DEBUG_TRACE_KEY) ?? '[]') as string[]
    current.push(entry)
    window.sessionStorage.setItem(DEBUG_TRACE_KEY, JSON.stringify(current.slice(-40)))
    window.dispatchEvent(new Event('culture-lint-debug-trace'))
  } catch {
    // Ignore storage failures; best-effort diagnostics only.
  }
}

export function RouteErrorBoundary() {
  const error = useRouteError()
  const message = resolveErrorMessage(error)

  useEffect(() => {
    pushDebugTrace(`route.error ${message}`)
  }, [message])

  return (
    <main className="safe-screen min-h-dvh bg-[#0a0c10] px-4 py-8 text-slate-100">
      <section className="mx-auto max-w-2xl rounded-xl border border-red-500/30 bg-black/40 p-6 shadow-[0_0_32px_rgba(239,68,68,0.15)]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-red-300">Route Error</p>
        <h1 className="mt-3 text-2xl font-semibold text-red-200">Something went wrong.</h1>
        <p className="mt-3 break-words font-mono text-sm text-slate-300">{message}</p>
        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="rounded-md border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
          >
            Return Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md border border-slate-600 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-400"
          >
            Reload
          </button>
        </div>
      </section>
    </main>
  )
}
