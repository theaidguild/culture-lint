import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Flame,
  Globe,
  Layers,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Terminal,
  X,
  Zap,
} from 'lucide-react'
import {
  detectBackend,
  ensurePipeline,
  generateAIScenarios,
  MODEL_PRESETS,
  SUPPORTED_COUNTRIES,
  type Backend,
  type GenerationProgress,
  type ModelPresetId,
} from '../services/aiScenarioGenerator'
import {
  type InteractiveSessionRun,
  type JudgmentItem,
  type JudgmentVerdict,
  type Principle,
  type ScenarioPreset,
} from '../types/linter'
import { buildJudgmentSequence, evaluateInteractiveSession } from '../engine/linterEngine'
import { JudgingStep } from './JudgingStep'
import { SessionResultStep } from './SessionResultStep'

interface AIScenarioStepProps {
  principles: Principle[]
}

type AIScreenState = 'setup' | 'generating' | 'generated' | 'judging' | 'results'

const DEFAULT_COUNTRY = 'BR'
const DEFAULT_COUNT = 6
const ALLOWED_COUNTS = [4, 6, 8] as const

const parsePrinciplesParam = (raw: string | null): string[] =>
  raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []

const parseCountParam = (raw: string | null): number => {
  const parsed = raw ? Number.parseInt(raw, 10) : NaN
  return (ALLOWED_COUNTS as readonly number[]).includes(parsed) ? parsed : DEFAULT_COUNT
}

export function AIScenarioStep({ principles }: AIScenarioStepProps) {
  const { t, i18n } = useTranslation()
  const isPt = i18n.language === 'pt-BR'
  const [searchParams, setSearchParams] = useSearchParams()

  // Setup form state, hydrated from URL params (and pushed back on change).
  const [selectedCountry, setSelectedCountry] = useState(
    () => searchParams.get('country') || DEFAULT_COUNTRY
  )
  const [selectedPrincipleIds, setSelectedPrincipleIds] = useState<string[]>(() => {
    const fromUrl = parsePrinciplesParam(searchParams.get('principles'))
    return fromUrl.length > 0 ? fromUrl : ['equality']
  })
  const [caseCount, setCaseCount] = useState<number>(() =>
    parseCountParam(searchParams.get('count'))
  )
  const [modelId, setModelId] = useState<ModelPresetId>(
    () => (searchParams.get('model') as ModelPresetId) || 'smollm2'
  )

  const [screenState, setScreenState] = useState<AIScreenState>('setup')
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([])
  const [generationLogs, setGenerationLogs] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [progress, setProgress] = useState<GenerationProgress>({
    phase: 'idle',
    percent: 0,
    label: '',
  })
  const [streamedText, setStreamedText] = useState('')
  const [backend, setBackend] = useState<Backend | null>(null)

  const [judgmentSequence, setJudgmentSequence] = useState<JudgmentItem[]>([])
  const [answers, setAnswers] = useState<Record<string, JudgmentVerdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionResult, setSessionResult] = useState<InteractiveSessionRun | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const analysisTimeoutRef = useRef<number | undefined>(undefined)
  const hasWarmedUp = useRef(false)

  const scenarioCount = Math.max(1, caseCount / 2)

  const selectedPrinciples = useMemo(() => {
    if (principles.length === 0) return []
    const validSelections = selectedPrincipleIds.filter((id) =>
      principles.some((principle) => principle.id === id)
    )
    if (validSelections.length > 0) return validSelections
    return [principles[0].id]
  }, [selectedPrincipleIds, principles])

  // Detect backend once on mount so the UI can display a chip immediately.
  useEffect(() => {
    let cancelled = false
    detectBackend(modelId).then((b) => {
      if (!cancelled) setBackend(b.device)
    })
    return () => {
      cancelled = true
    }
  }, [modelId])

  // Round-trip form state to the URL so the setup is deep-linkable.
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    next.set('country', selectedCountry)
    next.set('principles', selectedPrinciples.join(','))
    next.set('count', String(caseCount))
    if (modelId !== 'smollm2') {
      next.set('model', modelId)
    } else {
      next.delete('model')
    }
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry, selectedPrinciples, caseCount, modelId])

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) window.clearTimeout(analysisTimeoutRef.current)
      abortRef.current?.abort()
    }
  }, [])

  // Warm-up the pipeline on first meaningful form interaction (not on mount)
  // so that pressing Generate feels instantaneous when weights are ready.
  const scheduleWarmup = useCallback(() => {
    if (hasWarmedUp.current) return
    hasWarmedUp.current = true
    void (async () => {
      const b = await detectBackend(modelId)
      void ensurePipeline({
        model: MODEL_PRESETS[modelId],
        device: b.device,
        dtype: b.dtype,
      }).catch(() => {
        // Silent — warmup is best-effort.
        hasWarmedUp.current = false
      })
    })()
  }, [modelId])

  const handleGenerate = async () => {
    setScreenState('generating')
    setErrorMessage(null)
    setScenarios([])
    setStreamedText('')
    setGenerationLogs([
      t('aiScreen.generatingLog1'),
      t('aiScreen.generatingLog2'),
      t('aiScreen.generatingLog3'),
      t('aiScreen.generatingLog4'),
    ])

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const generated = await generateAIScenarios({
        countryCode: selectedCountry,
        language: i18n.language as 'en-US' | 'pt-BR',
        principleIds: selectedPrinciples,
        count: scenarioCount,
        model: modelId,
        signal: controller.signal,
        onProgress: (p) => {
          setProgress(p)
          setGenerationLogs((prev) => [
            ...prev,
            `[${p.phase.toUpperCase()} ${p.percent}%] ${p.label}`,
          ])
        },
        onToken: (chunk) => {
          setStreamedText((prev) => prev + chunk)
        },
      })

      if (controller.signal.aborted) return

      if (generated.length === 0) {
        throw new Error('No scenarios could be generated.')
      }

      setScenarios(generated)
      setScreenState('generated')
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        setScreenState('setup')
        return
      }
      console.error(err)
      const errMsg = err instanceof Error ? err.message : String(err)
      setErrorMessage(errMsg || t('aiScreen.generationFailed'))
      setScreenState('setup')
    } finally {
      abortRef.current = null
    }
  }

  const handleCancel = () => {
    abortRef.current?.abort()
  }

  const handleStartJudging = () => {
    const activeSeed = Math.random().toString(36).substring(7).toUpperCase()
    const seq = buildJudgmentSequence({ seed: activeSeed, scenarios })
    setJudgmentSequence(seq)
    setAnswers({})
    setCurrentIndex(0)
    setSessionResult(null)
    setScreenState('judging')
  }

  const handleVerdict = (verdict: JudgmentVerdict) => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) return
    const nextAnswers = { ...answers, [currentItem.id]: verdict }
    setAnswers(nextAnswers)

    if (currentIndex >= judgmentSequence.length - 1) {
      setIsAnalyzing(true)
      analysisTimeoutRef.current = window.setTimeout(() => {
        const resolvedPrinciple = (id: string) =>
          principles.find((p) => p.id === id) || principles[0]
        const rankingOrder = [
          ...selectedPrinciples,
          ...principles.map((p) => p.id).filter((id) => !selectedPrinciples.includes(id)),
        ]
        const result = evaluateInteractiveSession({
          seed: 'AI_DYNAMIC_GAUNTLET',
          principleRanking: rankingOrder,
          scenarios,
          answers: nextAnswers,
          resolvePrinciple: resolvedPrinciple,
        })
        setSessionResult(result)
        setIsAnalyzing(false)
        setScreenState('results')
      }, 1500)
      return
    }
    setCurrentIndex((prev) => prev + 1)
  }

  const handleBackInJudging = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }

  const activeComplication = useMemo(() => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) return undefined
    const siblingCaseKey = currentItem.caseKey === 'A' ? 'B' : 'A'
    const siblingId = `${currentItem.scenarioId}:${siblingCaseKey}`
    const siblingVerdict = answers[siblingId]
    if (siblingVerdict) {
      const verdictCapitalized = siblingVerdict === 'ACCEPTABLE' ? 'Acceptable' : 'Outrageous'
      const customComp = (currentItem as { complications?: Record<string, string> })
        .complications?.[`if${verdictCapitalized}`]
      if (customComp) return customComp
      return isPt
        ? `Você julgou o ato simétrico anterior como ${
            verdictCapitalized === 'Acceptable' ? 'ACEITÁVEL' : 'ULTRAJANTE'
          }. Como consequência, a IA injetou volatilidade: permissões subsequentes enfraquecem regras universais.`
        : `You judged the previous symmetric act as ${verdictCapitalized.toUpperCase()}. The compiler injected volatility: subsequent tolerances weaken universal resilience.`
    }
    return undefined
  }, [currentIndex, judgmentSequence, answers, isPt])

  const activeAntiGamingWarning = useMemo(() => {
    if (currentIndex < 3) return undefined
    const lastThree = judgmentSequence
      .slice(currentIndex - 3, currentIndex)
      .map((item) => answers[item.id])
    const allAcceptable = lastThree.every((val) => val === 'ACCEPTABLE')
    const allOutrageous = lastThree.every((val) => val === 'OUTRAGEOUS')
    if (allAcceptable) return t('judge.antiGamingAcceptable')
    if (allOutrageous) return t('judge.antiGamingOutrageous')
    return undefined
  }, [currentIndex, judgmentSequence, answers, t])

  const backendChip = backend ? (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-500/5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
      <Zap size={11} />
      {backend === 'webgpu' ? t('aiScreen.backendWebGPU') : t('aiScreen.backendWASM')}
    </span>
  ) : null

  return (
    <div className="flex-1 bg-[#0a0c10] text-slate-100 flex flex-col justify-start">
      {/* State A: Setup */}
      {screenState === 'setup' && (
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:px-6 md:py-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles size={20} />
            </span>
            <div className="flex-1">
              <h1 className="text-2xl font-black md:text-3xl text-white tracking-tight">
                {t('aiScreen.title')}
              </h1>
              <p className="text-xs font-mono text-cyan-400/80 mt-1 uppercase tracking-wider">
                {t('aiScreen.subtitle')}
              </p>
            </div>
            {backendChip}
          </div>

          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-3xl">
            {t('aiScreen.description')}
          </p>

          {errorMessage && (
            <div className="mt-6 border border-red-500/30 bg-red-500/5 px-4 py-3 rounded text-xs font-mono text-red-400">
              {errorMessage}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] gap-6 xl:gap-8 items-start">
            <div className="bg-[#111320] border border-[#21262d] p-5 sm:p-6 rounded-lg space-y-6 shadow-xl">
              <div>
                <label className="block mb-2 font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe size={13} className="text-cyan-400" />
                  {t('aiScreen.countryLabel')}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value)
                    scheduleWarmup()
                  }}
                  className="w-full rounded-md border border-[#30363d] bg-[#0c0f1c] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Layers size={13} className="text-cyan-400" />
                  {t('aiScreen.principleLabel')}
                </label>
                <p className="mb-3 text-[11px] font-mono text-slate-500 uppercase tracking-[0.18em]">
                  {selectedPrinciples.length} {isPt ? 'selecionado(s)' : 'selected'}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {principles.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        scheduleWarmup()
                        const nextSelectedIds = selectedPrinciples.includes(p.id)
                          ? selectedPrinciples.length === 1
                            ? selectedPrinciples
                            : selectedPrinciples.filter((id) => id !== p.id)
                          : [...selectedPrinciples, p.id]
                        setSelectedPrincipleIds(nextSelectedIds)
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-lg border text-left cursor-pointer transition ${
                        selectedPrinciples.includes(p.id)
                          ? 'border-cyan-400 bg-cyan-950/20 text-white shadow-[0_0_12px_rgba(34,211,238,0.15)]'
                          : 'border-[#21262d] bg-[#0c0f1c] hover:border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div>
                        <p className="font-mono text-xs font-black tracking-wide">{p.label}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{p.value}</p>
                      </div>
                      {selectedPrinciples.includes(p.id) && (
                        <CheckCircle2 size={16} className="text-cyan-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Settings2 size={13} className="text-cyan-400" />
                  {t('aiScreen.countLabel')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ALLOWED_COUNTS.map((cases) => (
                    <button
                      key={cases}
                      type="button"
                      onClick={() => setCaseCount(cases)}
                      className={`min-h-24 rounded-lg border p-3 text-left font-mono transition ${
                        caseCount === cases
                          ? 'border-cyan-400 bg-cyan-950/30 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.12)]'
                          : 'border-[#21262d] bg-[#0c0f1c] text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <span className="block text-2xl font-black leading-none">{cases}</span>
                      <span className="mt-2 block text-[10px] uppercase tracking-[0.18em]">
                        {isPt ? 'casos' : 'cases'}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500 leading-tight">
                        {cases / 2} {isPt ? 'cenários' : 'scenarios'} · {cases}{' '}
                        {isPt ? 'julgamentos' : 'judgments'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-2 font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider">
                  {isPt ? 'Modelo' : 'Model'}
                </label>
                <select
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value as ModelPresetId)}
                  className="w-full rounded-md border border-[#30363d] bg-[#0c0f1c] px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-400"
                >
                  <option value="smollm2">SmolLM2-360M-Instruct (fast)</option>
                  <option value="qwen25">Qwen2.5-0.5B-Instruct (quality)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-6 xl:sticky xl:top-6">
              <div className="bg-[#111320] border border-[#21262d] p-5 sm:p-6 rounded-lg space-y-4 shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400/80">
                      {isPt ? 'Resumo rápido' : 'Quick summary'}
                    </p>
                    <h2 className="mt-1 text-sm font-black text-white tracking-tight">
                      {isPt ? 'Visão geral da rodada' : 'Round overview'}
                    </h2>
                  </div>
                  <div className="inline-flex items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-950/20 px-3 py-1.5 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-[0.18em]">
                    {selectedPrinciples.length} {isPt ? 'princípios' : 'principles'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                  <div className="rounded-lg border border-[#21262d] bg-[#0c0f1c] p-3">
                    <span className="block text-slate-500 uppercase tracking-[0.18em]">
                      {isPt ? 'País' : 'Country'}
                    </span>
                    <span className="mt-1 block text-slate-100 font-bold">
                      {SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry)?.name}
                    </span>
                  </div>
                  <div className="rounded-lg border border-[#21262d] bg-[#0c0f1c] p-3">
                    <span className="block text-slate-500 uppercase tracking-[0.18em]">
                      {isPt ? 'Casos' : 'Cases'}
                    </span>
                    <span className="mt-1 block text-slate-100 font-bold">{caseCount}</span>
                  </div>
                  <div className="rounded-lg border border-[#21262d] bg-[#0c0f1c] p-3 col-span-2">
                    <span className="block text-slate-500 uppercase tracking-[0.18em]">
                      {isPt ? 'Princípios ativos' : 'Active principles'}
                    </span>
                    <span className="mt-1 block text-slate-100 font-bold leading-snug">
                      {principles
                        .filter((principle) => selectedPrinciples.includes(principle.id))
                        .map((principle) => principle.label)
                        .join(' • ')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 text-amber-400/90 text-xs font-mono bg-slate-900 border border-[#21262d] p-3 rounded-lg">
                  <Flame size={16} className="shrink-0 animate-pulse" />
                  <p className="leading-relaxed text-[11px]">{t('aiScreen.unreleasedWarning')}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-cyan-400 text-[#071018] font-mono text-xs font-black py-4 select-none cursor-pointer transition duration-300 transform hover:-translate-y-0.5 shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:bg-cyan-300 animate-pulse"
              >
                <Sparkles size={16} />
                {t('aiScreen.generateBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* State B: Generating */}
      {screenState === 'generating' && (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#03060c] border border-cyan-400/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.08)] flex flex-col h-[460px]">
            <header className="border-b border-[#21262d] bg-cyan-400/5 px-4 py-3 flex items-center justify-between font-mono text-xs text-cyan-300 select-none">
              <span className="flex items-center gap-1.5 animate-pulse font-bold">
                <Terminal size={14} />
                {t('aiScreen.generatingTitle')}
              </span>
              <div className="flex items-center gap-2">
                {backendChip}
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 rounded border border-red-500/40 bg-red-500/10 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-red-300 hover:bg-red-500/20 transition cursor-pointer"
                >
                  <X size={11} />
                  {t('aiScreen.cancel')}
                </button>
              </div>
            </header>
            <div className="border-b border-[#21262d] bg-[#010409] px-4 py-2">
              <div className="h-1 w-full overflow-hidden rounded bg-slate-800">
                <div
                  className="h-full bg-cyan-400 transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-mono text-[10px] text-slate-500">
                <span className="uppercase tracking-wider">{progress.phase}</span>
                <span>{progress.percent}%</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4 font-mono text-xs leading-relaxed space-y-1 bg-[#010409]">
              {generationLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-cyan-500/60 font-bold select-none">[v]</span>
                  <span className={log.startsWith('//') ? 'text-slate-500' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
              {streamedText && (
                <div className="mt-2 border-t border-slate-800 pt-2">
                  <div className="text-cyan-500/60 font-bold text-[10px] uppercase tracking-wider">
                    live token stream
                  </div>
                  <pre className="mt-1 whitespace-pre-wrap break-words text-[11px] text-emerald-300/80">
                    {streamedText}
                  </pre>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-cyan-400 mt-2 animate-pulse font-bold select-none">
                <span className="inline-block h-3 w-1.5 bg-cyan-400 animate-[bootCursor_900ms_step-end_infinite]" />
                <span>{t('aiScreen.compilingIndicator')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* State C: Generated Briefing */}
      {screenState === 'generated' && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:px-6 md:py-12 flex flex-col justify-between gap-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 size={20} />
              </span>
              <div className="flex-1">
                <h1 className="text-2xl font-black md:text-3xl text-white tracking-tight">
                  {t('aiScreen.resultsTitle')}
                </h1>
                <p className="text-xs font-mono text-emerald-400 mt-1 uppercase tracking-wider">
                  {SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry)?.name.toUpperCase()}{' '}
                  / {selectedPrinciples.join(' + ').toUpperCase()}
                </p>
              </div>
              {backendChip}
            </div>

            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {t('aiScreen.resultsDesc')}
            </p>

            {scenarios.length < scenarioCount && (
              <div className="mt-4 border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded text-xs font-mono text-amber-300">
                {t('aiScreen.partialResult', { got: scenarios.length, want: scenarioCount })}
              </div>
            )}

            <div className="mt-8 space-y-4">
              {scenarios.map((s) => (
                <div key={s.id} className="border border-[#21262d] bg-[#111320] rounded-lg p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {s.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {t('aiScreen.codeLabel')} {s.exceptionCode}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-white mt-2 tracking-tight">{s.title}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-xs font-mono text-slate-400 pt-3 border-t border-[#21262d]/50 leading-relaxed">
                    <div>
                      <span className="text-[10px] text-red-400/80 font-bold block mb-1">
                        {t('aiScreen.rivalEventLabel')}
                      </span>
                      <span className="text-slate-300 block">
                        {s.caseStudyA.subject} - {s.caseStudyA.act}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-300/80 font-bold block mb-1">
                        {t('aiScreen.allyEventLabel')}
                      </span>
                      <span className="text-slate-300 block">
                        {s.caseStudyB.subject} - {s.caseStudyB.act}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#21262d] grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_auto_auto] lg:items-center">
            <div className="flex items-start gap-3 rounded-xl border border-[#21262d] bg-[#0d1220] px-4 py-3 text-xs font-mono text-slate-500 shadow-lg">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Zap size={14} className="fill-current" />
              </span>
              <span className="leading-relaxed">{t('aiScreen.unreleasedWarning')}</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenState('setup')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#0c0f1c] px-5 py-3.5 font-mono text-xs font-black text-slate-200 transition hover:border-slate-500 hover:bg-[#121725] hover:text-white cursor-pointer lg:min-w-[170px]"
            >
              <RotateCcw size={14} />
              {t('sidebar.returnInitialState')}
            </button>
            <button
              type="button"
              onClick={handleStartJudging}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-400 px-5 py-3.5 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(34,211,238,0.22)] transition hover:from-cyan-200 hover:to-cyan-300 cursor-pointer lg:min-w-[220px]"
            >
              <Play size={14} className="fill-current" />
              {t('aiScreen.startBtn')}
            </button>
          </div>
        </div>
      )}

      {/* State D: Play gauntlet */}
      {screenState === 'judging' && (
        <JudgingStep
          item={judgmentSequence[currentIndex]}
          index={currentIndex}
          total={judgmentSequence.length}
          isAnalyzing={isAnalyzing}
          canGoBack={currentIndex > 0}
          activeComplication={activeComplication}
          activeAntiGamingWarning={activeAntiGamingWarning}
          onVerdict={handleVerdict}
          onBack={handleBackInJudging}
        />
      )}

      {/* State E: Results */}
      {screenState === 'results' && sessionResult && (
        <SessionResultStep
          session={sessionResult}
          principles={principles}
          onRerunSameSeed={handleStartJudging}
          onNewSeedRun={() => setScreenState('setup')}
        />
      )}
    </div>
  )
}
