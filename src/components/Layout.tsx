import { useTranslation } from 'react-i18next'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function Layout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const showFooter = pathname !== '/about'

  return (
    <main className="safe-screen min-h-dvh overflow-x-clip bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-70 sm:opacity-100" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_20%_100%,rgba(59,130,246,0.08),transparent_38%)]" />
      <div className="relative flex min-h-dvh flex-col md:flex-row">
        <Sidebar />
        <section className="flex min-h-dvh flex-1 flex-col border-t border-[#21262d] bg-[#0d1117]/95 pb-[calc(6.75rem+env(safe-area-inset-bottom))] sm:pb-24 md:border-l md:border-t-0 md:pb-0">
          <Outlet />
        </section>
      </div>
      {showFooter && (
        <footer className="pointer-events-none fixed inset-x-0 bottom-[4.6rem] z-10 border-t border-[#1c2230] bg-[#070a12]/85 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500 md:bottom-0 md:px-5">
          <div className="flex items-center justify-between">
            <span>{t('footer.idLabel')}: Proto-X-2026-07</span>
            <span>{t('footer.timestampLabel')}: 23:55:122</span>
            <span className="text-amber-400">{t('footer.classification')}</span>
          </div>
        </footer>
      )}
    </main>
  )
}
