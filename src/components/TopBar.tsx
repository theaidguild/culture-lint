import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const TOTAL_STEPS = 4

interface ProgressItem {
  label: string
  active: boolean
  complete: boolean
}

interface TopBarProps {
  progressItems: ProgressItem[]
  step: 1 | 2 | 3 | 4
  hasFailures: boolean
}

export function TopBar({ progressItems, step, hasFailures }: TopBarProps) {
  const { t, i18n } = useTranslation()
  const isPt = i18n.language === 'pt-BR'

  return (
    <header className="compact-header border-b border-[#21262d] bg-[#04070f]/94 px-4 py-2.5 text-sm text-slate-400 backdrop-blur sm:px-5 lg:px-9">
      <div className="flex min-h-12 flex-wrap items-center justify-between gap-y-3 md:flex-nowrap">
        <div className="flex min-w-0 items-center gap-2.5 text-slate-100">
          <span className="rounded-sm border border-cyan-300/50 bg-cyan-400 px-1.5 py-1 font-mono text-xs font-bold text-[#071018]">
            C
          </span>
          <div className="min-w-0">
            <span className="block truncate font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
              {isPt ? 'Moral Audit Protocol' : 'Moral Audit Protocol'}
            </span>
            <span className="block truncate text-xs font-semibold sm:text-sm">{t('appName')}</span>
          </div>
        </div>
        <div className="rounded border border-cyan-500/35 bg-cyan-500/10 px-3 py-1.5 font-mono text-xs text-cyan-200 lg:hidden">
          {t('topbar.stepCounter', { step, total: TOTAL_STEPS })}
        </div>

        <nav className="hidden items-center gap-4 xl:flex">
          {progressItems.map((item, index) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 ${
                item.active ? 'text-cyan-300' : item.complete ? 'text-emerald-400' : ''
              }`}
            >
              <span
                className={`grid h-5 w-5 place-items-center rounded-full border text-xs ${
                  item.active
                    ? 'border-cyan-300 bg-cyan-300 text-[#071018]'
                    : item.complete
                      ? 'border-emerald-400'
                      : 'border-slate-700'
                }`}
              >
                {item.complete ? <Check size={12} /> : index + 1}
              </span>
              <span className="max-w-[9rem] truncate text-[11px] uppercase tracking-[0.08em]">
                {item.label}
              </span>
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-3 font-mono sm:gap-4">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <span className="hidden sm:inline">{t('language.label')}</span>
            <select
              value={i18n.language}
              onChange={(event) => {
                void i18n.changeLanguage(event.target.value)
              }}
              className="rounded border border-[#30363d] bg-[#0b0d17] px-2 py-1.5 text-xs text-slate-100 outline-none transition hover:border-slate-500"
            >
              <option value="pt-BR">{t('language.ptBR')}</option>
              <option value="en-US">{t('language.enUS')}</option>
            </select>
          </label>
          {step === 4 && hasFailures && (
            <span className="rounded border border-red-500/70 px-2 py-1 text-xs text-red-400 sm:px-3">
              {t('topbar.compileFailed')}
            </span>
          )}
          <span className="hidden xl:inline">{t('topbar.analyst')}</span>
          <span className="hidden h-7 w-7 rounded-full border border-indigo-400/40 bg-indigo-500/25 xl:block" />
        </div>
      </div>

      <div className="mt-2 hidden items-center justify-between rounded border border-[#253142] bg-[#070d17]/95 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-slate-500 sm:flex">
        <span>session: AX-774</span>
        <span>
          {t('topbar.stepCounter', { step, total: TOTAL_STEPS })} //{' '}
          {isPt ? 'protocolo ativo' : 'protocol active'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-cyan-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
          monitor_linked
        </span>
      </div>
    </header>
  )
}
