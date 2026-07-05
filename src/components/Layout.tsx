import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  return (
    <main className="safe-screen min-h-dvh overflow-x-clip bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-70 sm:opacity-100" />
      <div className="relative flex min-h-dvh flex-col md:flex-row">
        <Sidebar />
        <section className="flex min-h-dvh flex-1 flex-col border-t border-[#21262d] bg-[#0d1117]/95 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-24 md:border-l md:border-t-0 md:pb-0">
          <Outlet />
        </section>
      </div>
    </main>
  )
}
