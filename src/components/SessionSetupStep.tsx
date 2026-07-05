import {
  Check,
  ChevronLeft,
  Copy,
  RefreshCw,
  Zap,
  Users,
  Shield,
  Compass,
  Microscope,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface SessionSetupStepProps {
  seed: string
  itemCount: number
  onSeedChange: (value: string) => void
  onNewSeed: () => void
  onBack: () => void
  onStart: () => void
  currentPreset: string
  onPresetChange: (presetId: string) => void
}

export function SessionSetupStep({
  seed,
  itemCount,
  onSeedChange,
  onNewSeed,
  onBack,
  onStart,
  currentPreset,
  onPresetChange,
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
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
          {t('session.description')}
        </p>

        {/* Preset Selector */}
        <div className="mt-8 rounded-lg border border-[#21262d] bg-[#111320] p-5 sm:p-6">
          <h3 className="font-mono text-sm font-black text-cyan-300 mb-5 tracking-wider flex items-center gap-2 border-b border-[#21262d] pb-3">
            <Compass size={16} className="text-cyan-400" />
            {t('session.presetsLabel').toUpperCase()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
            {/* Versão Pais */}
            <button
              type="button"
              onClick={() => onPresetChange('pais')}
              className={`group flex flex-col justify-between p-5 rounded-xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                currentPreset === 'pais'
                  ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'border-[#21262d] bg-[#0c0f1c] hover:border-emerald-500/50 hover:bg-[#161a29]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center p-2 rounded-lg bg-emerald-500/10 ${
                      currentPreset === 'pais'
                        ? 'text-emerald-300'
                        : 'text-emerald-400 group-hover:scale-110 transition-transform duration-300'
                    }`}
                  >
                    <Users size={18} />
                  </span>
                  <span className="font-mono text-[9px] tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded-full text-emerald-400 font-bold whitespace-nowrap">
                    +70 Anos
                  </span>
                </div>
                <h4 className="mt-4 text-sm font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors duration-300">
                  {t('session.presetPais')}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {t('session.presetPaisDesc')}
                </p>
              </div>
            </button>

            {/* Versão Sobrinhos */}
            <button
              type="button"
              onClick={() => onPresetChange('jovens')}
              className={`group flex flex-col justify-between p-5 rounded-xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                currentPreset === 'jovens'
                  ? 'border-yellow-400 bg-yellow-950/20 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  : 'border-[#21262d] bg-[#0c0f1c] hover:border-yellow-500/50 hover:bg-[#161a29]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center p-2 rounded-lg bg-yellow-500/10 ${
                      currentPreset === 'jovens'
                        ? 'text-yellow-300'
                        : 'text-yellow-400 group-hover:scale-110 transition-transform duration-300'
                    }`}
                  >
                    <Compass size={18} />
                  </span>
                  <span className="font-mono text-[9px] tracking-wider uppercase bg-yellow-500/10 px-2 py-0.5 rounded-full text-yellow-400 font-bold whitespace-nowrap">
                    21 Anos
                  </span>
                </div>
                <h4 className="mt-4 text-sm font-black tracking-tight text-white group-hover:text-yellow-300 transition-colors duration-300">
                  {t('session.presetJovens')}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {t('session.presetJovensDesc')}
                </p>
              </div>
            </button>

            {/* Versão Biólogos */}
            <button
              type="button"
              onClick={() => onPresetChange('biologos')}
              className={`group flex flex-col justify-between p-5 rounded-xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                currentPreset === 'biologos'
                  ? 'border-teal-400 bg-teal-950/20 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                  : 'border-[#21262d] bg-[#0c0f1c] hover:border-teal-500/50 hover:bg-[#161a29]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center p-2 rounded-lg bg-teal-500/10 ${
                      currentPreset === 'biologos'
                        ? 'text-teal-300'
                        : 'text-teal-400 group-hover:scale-110 transition-transform duration-300'
                    }`}
                  >
                    <Microscope size={18} />
                  </span>
                  <span className="font-mono text-[9px] tracking-wider uppercase bg-teal-500/10 px-2 py-0.5 rounded-full text-teal-400 font-bold whitespace-nowrap">
                    Científico
                  </span>
                </div>
                <h4 className="mt-4 text-sm font-black tracking-tight text-white group-hover:text-teal-300 transition-colors duration-300">
                  {t('session.presetBiologos')}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {t('session.presetBiologosDesc')}
                </p>
              </div>
            </button>

            {/* Casos Originais */}
            <button
              type="button"
              onClick={() => onPresetChange('originais')}
              className={`group flex flex-col justify-between p-5 rounded-xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                currentPreset === 'originais'
                  ? 'border-blue-400 bg-blue-950/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                  : 'border-[#21262d] bg-[#0c0f1c] hover:border-blue-500/50 hover:bg-[#161a29]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 ${
                      currentPreset === 'originais'
                        ? 'text-blue-300'
                        : 'text-blue-400 group-hover:scale-110 transition-transform duration-300'
                    }`}
                  >
                    <Shield size={18} />
                  </span>
                  <span className="font-mono text-[9px] tracking-wider uppercase bg-blue-500/10 px-2 py-0.5 rounded-full text-blue-400 font-bold whitespace-nowrap">
                    Original
                  </span>
                </div>
                <h4 className="mt-4 text-sm font-black tracking-tight text-white group-hover:text-blue-300 transition-colors duration-300">
                  {t('session.presetOriginais')}
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  {t('session.presetOriginaisDesc')}
                </p>
              </div>
            </button>

            {/* Todos os Casos */}
            <button
              type="button"
              onClick={() => onPresetChange('todos')}
              className={`group col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between p-5 rounded-xl border text-left transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer ${
                currentPreset === 'todos'
                  ? 'border-purple-400 bg-purple-950/20 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                  : 'border-[#21262d] bg-[#0c0f1c] hover:border-purple-500/50 hover:bg-[#161a29]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 w-full">
                <div className="flex items-center justify-between md:block">
                  <span
                    className={`inline-flex items-center justify-center p-2.5 rounded-xl bg-purple-500/10 ${
                      currentPreset === 'todos'
                        ? 'text-purple-300'
                        : 'text-purple-400 group-hover:scale-110 transition-transform duration-300'
                    }`}
                  >
                    <Sparkles size={20} />
                  </span>
                  <span className="md:hidden font-mono text-[9px] tracking-wider uppercase bg-purple-500/10 px-2 py-0.5 rounded-full text-purple-400 font-bold whitespace-nowrap">
                    Completo
                  </span>
                </div>

                <div className="flex-1">
                  <div className="hidden md:flex items-center gap-2">
                    <h4 className="text-sm font-black tracking-tight text-white group-hover:text-purple-300 transition-colors duration-300">
                      {t('session.presetTodos')}
                    </h4>
                    <span className="font-mono text-[9px] tracking-wider uppercase bg-purple-500/10 px-2 py-0.5 rounded-full text-purple-400 font-bold whitespace-nowrap">
                      Completo
                    </span>
                  </div>
                  <h4 className="md:hidden text-sm font-black tracking-tight text-white">
                    {t('session.presetTodos')}
                  </h4>
                  <p className="mt-1 md:mt-1.5 text-xs leading-relaxed text-slate-400">
                    {t('session.presetTodosDesc')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-cyan-400/40 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.10)] sm:p-6">
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
