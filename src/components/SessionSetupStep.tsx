import { Check, ChevronLeft, Copy, RefreshCw, Zap } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SessionSetupStepProps {
  seed: string
  itemCount: number
  onSeedChange: (value: string) => void
  onNewSeed: () => void
  onBack: () => void
  onStart: () => void
}

export function SessionSetupStep({
  seed,
  itemCount,
  onSeedChange,
  onNewSeed,
  onBack,
  onStart,
}: SessionSetupStepProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const copyResetRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    return () => {
      if (copyResetRef.current !== undefined) {
        window.clearTimeout(copyResetRef.current)
      }
    }
  }, [])

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (copyResetRef.current !== undefined) {
        window.clearTimeout(copyResetRef.current)
      }
      copyResetRef.current = window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-3xl">
        <p className="font-mono text-sm text-slate-400">{t('session.armed')}</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">
          {t('session.title')}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{t('session.description')}</p>

        <div className="mt-8 rounded-lg border border-cyan-400/40 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.10)] sm:p-6">
          <div className="flex items-center gap-2 font-mono text-sm font-black text-cyan-300">
            <Zap size={15} className="text-yellow-300" /> {t('session.briefingTitle')}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{t('session.briefingBody')}</p>
          <p className="mt-4 font-mono text-sm text-cyan-200">
            {t('session.itemsQueued', { count: itemCount })}
          </p>
        </div>

        <div className="mt-6 rounded-lg border border-[#21262d] bg-[#111320] p-5 sm:p-6">
          <label className="block">
            <span className="font-mono text-sm font-black text-cyan-300">
              {t('session.seedLabel')}
            </span>
            <p className="mt-1 font-mono text-xs text-slate-500">{t('session.seedHint')}</p>
            <input
              value={seed}
              onChange={(event) => onSeedChange(event.target.value)}
              spellCheck={false}
              autoCapitalize="characters"
              className="mt-3 w-full rounded border border-[#21262d] bg-[#0c0f1c] px-4 py-3 font-mono text-sm uppercase tracking-[0.3em] text-cyan-200 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,240,255,0.16)]"
            />
          </label>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onNewSeed}
              className="flex items-center justify-center gap-2 rounded-md border border-[#30363d] px-4 py-2.5 font-mono text-xs font-black text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200"
            >
              <RefreshCw size={14} /> {t('session.newSeed')}
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 rounded-md border border-[#30363d] px-4 py-2.5 font-mono text-xs font-black text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? t('session.copied') : t('session.copyLink')}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:flex-row sm:justify-between sm:pb-2 md:mt-12 md:pb-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 rounded-md border border-[#30363d] px-6 py-3.5 font-mono text-xs font-black text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200"
          >
            <ChevronLeft size={14} /> {t('session.back')}
          </button>
          <button
            type="button"
            onClick={onStart}
            className="w-full rounded-md bg-cyan-400 px-8 py-3.5 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
          >
            {t('session.start')} ⚡
          </button>
        </div>
      </div>
    </div>
  )
}
