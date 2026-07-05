import {
  ChevronLeft,
  FileCode2,
  ThumbsDown,
  ThumbsUp,
  ShieldAlert,
  AlertTriangle,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type JudgmentItem, type JudgmentVerdict } from '../types/linter'

interface JudgingStepProps {
  item: JudgmentItem | undefined
  index: number
  total: number
  isAnalyzing: boolean
  canGoBack: boolean
  activeComplication?: string
  activeAntiGamingWarning?: string
  onVerdict: (verdict: JudgmentVerdict) => void
  onBack: () => void
}

export function JudgingStep({
  item,
  index,
  total,
  isAnalyzing,
  canGoBack,
  activeComplication,
  activeAntiGamingWarning,
  onVerdict,
  onBack,
}: JudgingStepProps) {
  const { t } = useTranslation()

  if (isAnalyzing || !item) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="text-center font-mono">
          <p className="animate-pulse text-lg font-black text-cyan-300">{t('judge.analyzing')}</p>
          <p className="mt-3 text-sm text-slate-500">{t('judge.analyzingHint')}</p>
        </div>
      </div>
    )
  }

  const progressPercent = Math.round((index / Math.max(1, total)) * 100)

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span className="text-cyan-300">
            {t('judge.progress', { current: index + 1, total })}
          </span>
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            className="flex items-center gap-1 rounded-md border border-[#30363d] px-3 py-1.5 font-black text-slate-300 transition hover:border-cyan-400/60 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={13} /> {t('judge.back')}
          </button>
        </div>
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#21262d]">
          <div
            className="h-full bg-cyan-400 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <h1 className="mt-8 text-xl font-black tracking-tight text-white sm:text-2xl md:text-3xl">
          {t('judge.title')}
        </h1>

        {activeAntiGamingWarning && (
          <div className="mt-6 animate-pulse rounded-lg border border-red-500/60 bg-red-950/20 p-4 shadow-[0_0_25px_rgba(239,68,68,0.15)] bg-slate-900 border-opacity-70">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-red-400">
              <ShieldAlert className="animate-bounce" size={15} />
              {t('judge.antiGamingHeader')}
            </div>
            <p className="mt-2 font-mono text-xs leading-5 text-red-200">
              {activeAntiGamingWarning}
            </p>
          </div>
        )}

        <section className="mt-6 rounded-lg border border-[#21262d] bg-[#111320] p-5 shadow-2xl shadow-black/30 sm:p-7">
          <div className="flex items-center gap-2 font-mono text-xs font-black text-cyan-300">
            <FileCode2 size={14} /> {t('judge.caseFile')}
          </div>
          <div className="mt-5 space-y-4 font-mono text-sm leading-6 text-slate-200">
            <div>
              <p className="text-xs font-black text-slate-500">{t('judge.subjectLabel')}</p>
              <p className="mt-1 text-slate-100">{item.subject}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-500">{t('judge.actLabel')}</p>
              <p className="mt-1 text-slate-100">{item.act}</p>
            </div>
            <div>
              <p className="text-xs font-black text-slate-500">{t('judge.contextLabel')}</p>
              <p className="mt-1 text-slate-300">{item.context}</p>
            </div>
          </div>
        </section>

        {activeComplication && (
          <div className="mt-6 rounded-lg border border-amber-500/60 bg-amber-505 bg-slate-900 border-opacity-70 p-5 shadow-[0_0_25px_rgba(245,158,11,0.15)] sm:p-7">
            <div className="flex items-center gap-2 font-mono text-xs font-black text-amber-400">
              <AlertTriangle className="animate-pulse" size={15} />
              {t('judge.complicationHeader')}
            </div>
            <p className="mt-1 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
              {t('judge.complicationSub')}
            </p>
            <div className="mt-4 border-l-2 border-amber-500 bg-amber-500/5 px-4 py-3">
              <p className="font-mono text-sm leading-6 text-amber-200">{activeComplication}</p>
            </div>
          </div>
        )}

        <p className="mt-8 text-center font-mono text-sm font-black text-slate-300">
          {t('judge.prompt')}
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onVerdict('ACCEPTABLE')}
            className="group flex items-center justify-center gap-3 rounded-lg border border-emerald-500/50 bg-emerald-500/5 px-6 py-6 font-mono text-sm font-black text-emerald-300 transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-500/10 hover:shadow-[0_0_30px_rgba(86,211,100,0.2)]"
          >
            <ThumbsUp size={20} /> {t('judge.acceptable')}
          </button>
          <button
            type="button"
            onClick={() => onVerdict('OUTRAGEOUS')}
            className="group flex items-center justify-center gap-3 rounded-lg border border-red-500/50 bg-red-400/5 px-6 py-6 font-mono text-sm font-black text-red-300 transition hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-500/10 hover:shadow-[0_0_30px_rgba(248,81,73,0.2)]"
          >
            <ThumbsDown size={20} /> {t('judge.outrageous')}
          </button>
        </div>
      </div>
    </div>
  )
}
