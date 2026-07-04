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

  return (
    <header className="compact-header flex min-h-16 flex-wrap items-center justify-between gap-y-3 border-b border-[#21262d] bg-[#0b0d17] px-4 py-3 text-sm text-slate-400 sm:px-5 md:h-16 md:flex-nowrap md:py-0 lg:px-9">
      <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
        <span className="rounded-sm bg-cyan-400 px-1.5 py-1 text-xs text-[#071018]">C</span>
        <span className="text-xs sm:text-sm">{t('appName')}</span>
      </div>
      <div className="rounded border border-[#30363d] px-3 py-1.5 font-mono text-xs text-slate-300 lg:hidden">
        {`Step ${step} / ${TOTAL_STEPS}`}
      </div>
      <nav className="hidden items-center gap-6 lg:flex">
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
            <span>{item.label}</span>
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
            className="rounded border border-[#30363d] bg-[#0b0d17] px-2 py-1.5 text-xs text-slate-100 outline-none"
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
        <span className="hidden lg:inline">{t('topbar.analyst')}</span>
        <span className="hidden h-7 w-7 rounded-full bg-indigo-500/25 lg:block" />
      </div>
    </header>
  )
}
