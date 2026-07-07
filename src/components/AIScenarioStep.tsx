import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  Globe,
  Layers,
  Play,
  RotateCcw,
  Settings2,
  Scale,
  X,
  Zap,
} from 'lucide-react'
import {
  resolveSafeModelId,
  resolveSafeScenarioCount,
  SUPPORTED_COUNTRIES,
  type GenerationProgress,
  type GenerationUiStage,
  type ModelPresetId,
  suggestDefaultModelId,
} from '../services/aiScenarioGenerator'
import { cancelAIRequest, requestAIGenerate } from '../services/aiWorkerClient'
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
  onStepChange?: (step: AIHeaderStep) => void
  onHasFailures?: (value: boolean) => void
}

type AIScreenState = 'setup' | 'generating' | 'generated' | 'judging' | 'results'
type FeedbackMessage = { tone: 'info' | 'error'; text: string }
export type AIHeaderStep = 1 | 2 | 3 | 4

const DEFAULT_COUNTRY = 'BR'
const DEFAULT_COUNT = 6
const ALLOWED_COUNTS = [4, 6, 8, 10, 12, 16, 18, 20] as const
const GENERATION_STAGE_ORDER = ['preparing', 'drafting', 'finalizing'] as const
const AI_DEBUG_PREFIX = '[ai-debug][ui]'

function resolveGenerationErrorMessage(
  error: unknown,
  t: ReturnType<typeof useTranslation>['t']
): string {
  if (!(error instanceof Error)) return t('aiScreen.generationFailed')

  if (error.message === 'runpod-http-403') {
    return t('aiScreen.generationForbidden')
  }

  if (error.message === 'runpod-timeout') {
    return t('aiScreen.generationTimeout')
  }

  if (error.message === 'runpod-missing-required-topics') {
    return t('aiScreen.generationMissingTopics')
  }

  return t('aiScreen.generationFailed')
}

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
}

const normalizeGenerationStage = (
  stage?: GenerationUiStage
): (typeof GENERATION_STAGE_ORDER)[number] => {
  if (stage === 'drafting' || stage === 'refining') return 'drafting'
  if (stage === 'finalizing' || stage === 'done') return 'finalizing'
  return 'preparing'
}

export function AIScenarioStep({ principles, onStepChange, onHasFailures }: AIScenarioStepProps) {
  const { t, i18n } = useTranslation()
  const defaultModelId = useMemo(() => suggestDefaultModelId(), [])

  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY)
  const [selectedPrincipleIds, setSelectedPrincipleIds] = useState<string[]>(['equality'])
  const [caseCount, setCaseCount] = useState<number>(DEFAULT_COUNT)
  const [modelId] = useState<ModelPresetId>(defaultModelId)

  const [screenState, setScreenState] = useState<AIScreenState>('setup')
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([])
  const [feedbackMessage, setFeedbackMessage] = useState<FeedbackMessage | null>(null)
  const [progress, setProgress] = useState<GenerationProgress>({
    phase: 'idle',
    percent: 0,
    label: '',
    uiStage: 'preparing',
  })
  const [isCancelling, setIsCancelling] = useState(false)

  const [judgmentSequence, setJudgmentSequence] = useState<JudgmentItem[]>([])
  const [answers, setAnswers] = useState<Record<string, JudgmentVerdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionResult, setSessionResult] = useState<InteractiveSessionRun | null>(null)

  const analysisTimeoutRef = useRef<number | undefined>(undefined)
  const activeGenerateRequestIdRef = useRef<string | null>(null)

  const scenarioCount = resolveSafeScenarioCount(caseCount / 2)

  const selectedPrinciples = useMemo(() => {
    if (principles.length === 0) return []
    const validSelections = selectedPrincipleIds.filter((id) =>
      principles.some((principle) => principle.id === id)
    )
    if (validSelections.length > 0) return validSelections
    return [principles[0].id]
  }, [selectedPrincipleIds, principles])

  useEffect(() => {
    return () => {
      if (analysisTimeoutRef.current) window.clearTimeout(analysisTimeoutRef.current)
      const activeRequest = activeGenerateRequestIdRef.current
      if (activeRequest) {
        cancelAIRequest(activeRequest)
      }
    }
  }, [])

  useEffect(() => {
    if (!onStepChange) return

    const stepByState: Record<AIScreenState, AIHeaderStep> = {
      setup: 1,
      generating: 2,
      generated: 2,
      judging: 3,
      results: 4,
    }

    onStepChange(stepByState[screenState])
  }, [onStepChange, screenState])

  useEffect(() => {
    onHasFailures?.((sessionResult?.contradictionCount ?? 0) > 0)
  }, [onHasFailures, sessionResult])

  const handleGenerate = async () => {
    setScreenState('generating')
    setFeedbackMessage(null)
    setScenarios([])
    setIsCancelling(false)
    setProgress({
      phase: 'idle',
      percent: 0,
      label: '',
      uiStage: 'preparing',
      itemsCompleted: 0,
      itemsTotal: scenarioCount,
    })

    const { requestId, promise } = requestAIGenerate({
      modelId: resolveSafeModelId(modelId),
      countryCode: selectedCountry,
      language: i18n.language as 'en-US' | 'pt-BR',
      principleIds: selectedPrinciples,
      count: resolveSafeScenarioCount(scenarioCount),
      onProgress: (nextProgress) => setProgress(nextProgress),
    })
    activeGenerateRequestIdRef.current = requestId
    debugLog('generate requested', {
      requestId,
      modelId,
      countryCode: selectedCountry,
      count: scenarioCount,
      principleIds: selectedPrinciples,
    })

    try {
      const generated = await promise

      if (generated.length === 0) {
        throw new Error('No scenarios could be generated.')
      }

      setScenarios(generated)
      setScreenState('generated')
      debugLog('generate resolved', { requestId, scenarios: generated.length })
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'aborted') {
        debugLog('generate aborted', { requestId })
        setIsCancelling(false)
        setFeedbackMessage({ tone: 'info', text: t('aiScreen.generationCanceled') })
        setScreenState('setup')
        return
      }
      debugLog('generate failed', {
        requestId,
        message: err instanceof Error ? err.message : String(err),
      })
      console.error(err)
      setFeedbackMessage({ tone: 'error', text: resolveGenerationErrorMessage(err, t) })
      setScreenState('setup')
    } finally {
      setIsCancelling(false)
      activeGenerateRequestIdRef.current = null
    }
  }

  const handleCancel = () => {
    setIsCancelling(true)
    const requestId = activeGenerateRequestIdRef.current
    if (!requestId) return

    debugLog('cancel requested', { requestId })

    cancelAIRequest(requestId)
    activeGenerateRequestIdRef.current = null
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
      const verdictText =
        siblingVerdict === 'ACCEPTABLE' ? t('judge.acceptable') : t('judge.outrageous')
      return t('judge.complicationFeedback', { verdict: verdictText })
    }
    return undefined
  }, [currentIndex, judgmentSequence, answers, t])

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

  const normalizedGenerationStage = normalizeGenerationStage(progress.uiStage)

  const generationStageCards = useMemo(() => {
    const activeIndex = GENERATION_STAGE_ORDER.indexOf(normalizedGenerationStage)
    return GENERATION_STAGE_ORDER.map((stage, index) => ({
      stage,
      label: t(`aiScreen.progressStep${stage.charAt(0).toUpperCase()}${stage.slice(1)}`),
      status: index < activeIndex ? 'complete' : index === activeIndex ? 'active' : 'pending',
    }))
  }, [normalizedGenerationStage, t])

  const generationCopy = useMemo(() => {
    const inFlightScenario = Math.min(
      scenarioCount,
      Math.max(1, (progress.itemsCompleted ?? 0) + (progress.uiStage === 'drafting' ? 1 : 0))
    )

    if (isCancelling) {
      return {
        title: t('aiScreen.progressTitleCanceling'),
        description: t('aiScreen.progressBodyCanceling'),
        detail: t('aiScreen.progressHint'),
      }
    }

    switch (progress.uiStage) {
      case 'drafting':
        return {
          title: t('aiScreen.progressTitleDrafting'),
          description: t('aiScreen.progressBodyDrafting'),
          detail: t('aiScreen.progressCountDrafting', {
            current: inFlightScenario,
            total: progress.itemsTotal ?? scenarioCount,
          }),
        }
      case 'refining':
        return {
          title: t('aiScreen.progressTitleRefining'),
          description: t('aiScreen.progressBodyRefining'),
          detail: t('aiScreen.progressCountRefining', {
            current: Math.min(scenarioCount, (progress.itemsCompleted ?? 0) + 1),
            total: progress.itemsTotal ?? scenarioCount,
          }),
        }
      case 'finalizing':
      case 'done':
        return {
          title: t('aiScreen.progressTitleFinalizing'),
          description: t('aiScreen.progressBodyFinalizing'),
          detail: t('aiScreen.progressHint'),
        }
      case 'preparing':
      default:
        return {
          title: t('aiScreen.progressTitlePreparing'),
          description: t('aiScreen.progressBodyPreparing'),
          detail: t('aiScreen.progressHint'),
        }
    }
  }, [
    isCancelling,
    progress.itemsCompleted,
    progress.itemsTotal,
    progress.uiStage,
    scenarioCount,
    t,
  ])

  return (
    <div className="audit-scan flex flex-1 flex-col justify-start bg-[#0a0c10] text-slate-100">
      {/* State A: Setup */}
      {screenState === 'setup' && (
        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-7 sm:px-6 md:py-12">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Scale size={20} />
            </span>
            <div className="flex-1">
              <p className="audit-panel-title">{t('aiScreen.setupEyebrow')}</p>
              <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
                {t('aiScreen.title')}
              </h1>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.12em] text-cyan-400/80 sm:text-xs sm:tracking-wider">
                {t('aiScreen.subtitle')}
              </p>
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-slate-300">
            {t('aiScreen.description')}
          </p>

          {feedbackMessage && (
            <div
              className={`mt-6 rounded border px-4 py-3 text-xs font-mono ${
                feedbackMessage.tone === 'error'
                  ? 'border-red-500/30 bg-red-500/5 text-red-400'
                  : 'border-cyan-400/30 bg-cyan-500/5 text-cyan-300'
              }`}
            >
              {feedbackMessage.text}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-5">
            <div className="audit-panel rounded-xl border border-[#263144] p-0 shadow-[0_0_35px_rgba(8,15,30,0.45)]">
              <div className="flex items-center justify-between border-b border-[#263144] px-4 py-3 sm:px-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-300">
                  {t('aiScreen.simulationParameters')}
                </p>
                <span className="rounded border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-cyan-300">
                  {t('aiScreen.statusReady')}
                </span>
              </div>

              <div className="space-y-5 px-4 py-4 sm:px-5 sm:py-5">
                <div className="rounded border border-[#253142] bg-[#0b1220] p-3">
                  <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    <Globe size={12} className="text-cyan-400" />
                    {t('aiScreen.countryLabel')}
                  </label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value)
                    }}
                    className="w-full rounded border border-[#30363d] bg-[#0a0f19] px-3 py-2.5 font-mono text-xs text-slate-100 outline-none focus:border-cyan-400"
                  >
                    {SUPPORTED_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded border border-[#253142] bg-[#0b1220] p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                      <Layers size={12} className="text-cyan-400" />
                      {t('aiScreen.principleLabel')}
                    </label>
                    <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                      {selectedPrinciples.length} {t('aiScreen.activeCount')}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {principles.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          const nextSelectedIds = selectedPrinciples.includes(p.id)
                            ? selectedPrinciples.length === 1
                              ? selectedPrinciples
                              : selectedPrinciples.filter((id) => id !== p.id)
                            : [...selectedPrinciples, p.id]
                          setSelectedPrincipleIds(nextSelectedIds)
                        }}
                        className={`flex min-h-[3.8rem] cursor-pointer items-center justify-between rounded border px-3 py-2.5 text-left transition ${
                          selectedPrinciples.includes(p.id)
                            ? 'border-cyan-400 bg-cyan-950/20 text-white'
                            : 'border-[#21262d] bg-[#0c0f1c] text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div>
                          <p className="font-mono text-[11px] font-black tracking-wide text-current">
                            {p.label}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-slate-400">
                            {p.value}
                          </p>
                        </div>
                        {selectedPrinciples.includes(p.id) && (
                          <CheckCircle2 size={15} className="ml-2 shrink-0 text-cyan-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded border border-[#253142] bg-[#0b1220] p-3">
                  <label className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    <Settings2 size={12} className="text-cyan-400" />
                    {t('aiScreen.countLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {ALLOWED_COUNTS.map((cases) => (
                      <button
                        key={cases}
                        type="button"
                        onClick={() => setCaseCount(cases)}
                        className={`rounded border px-2 py-2.5 text-left font-mono transition ${
                          caseCount === cases
                            ? 'border-cyan-400 bg-cyan-950/30 text-cyan-300'
                            : 'border-[#21262d] bg-[#0c0f1c] text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <span className="block text-xl font-black leading-none">{cases}</span>
                        <span className="mt-1 block text-[9px] uppercase tracking-[0.16em]">
                          {t('aiScreen.countCases')}
                        </span>
                      </button>
                    ))}
                  </div>
                  {selectedPrinciples.length > 0 && (
                    <p
                      className={`mt-2 font-mono text-[10px] leading-snug ${
                        caseCount < selectedPrinciples.length
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {caseCount < selectedPrinciples.length
                        ? t('aiScreen.casesHintUnderCovered', {
                            principleCount: selectedPrinciples.length,
                          })
                        : caseCount === selectedPrinciples.length
                          ? t('aiScreen.casesHintSingle')
                          : t('aiScreen.casesHintCoverage', {
                              ratio: Math.floor(caseCount / selectedPrinciples.length),
                              caseCount,
                            })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="audit-primary-btn w-full select-none rounded-xl border border-cyan-300/60 bg-cyan-400 py-4 font-mono text-xs font-black text-[#071018] transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:transform-none disabled:bg-cyan-500/40 disabled:text-slate-200 disabled:shadow-none"
            >
              <span className="inline-flex items-center justify-center gap-2.5">
                <Scale size={16} />
                {t('aiScreen.generateBtn')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* State B: Generating */}
      {screenState === 'generating' && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
          <section
            role="status"
            aria-live="polite"
            className="relative w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#21262d] bg-[#0b0d17] shadow-[0_0_60px_rgba(15,23,42,0.35)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(0,240,255,0.12),transparent_38%),radial-gradient(circle_at_82%_22%,rgba(148,163,184,0.09),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_65%)]" />
            <div className="relative px-5 py-6 sm:px-8 sm:py-8 md:px-10 md:py-10">
              <div className="flex flex-col gap-5 border-b border-white/8 pb-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-[0.28em] text-cyan-300/75">
                    {t('aiScreen.progressEyebrow')}
                  </p>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-[2rem]">
                    {generationCopy.title}
                  </h2>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">
                    {generationCopy.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#30363d] bg-white/5 px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-slate-200 transition hover:border-slate-500 hover:bg-white/8 disabled:cursor-default disabled:border-slate-700 disabled:text-slate-500"
                >
                  <X size={12} />
                  {isCancelling ? t('aiScreen.canceling') : t('aiScreen.cancel')}
                </button>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(260px,0.8fr)]">
                <div className="rounded-[24px] border border-white/8 bg-black/20 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                        {t('aiScreen.progressCurrentLabel')}
                      </p>
                      <p className="mt-2 text-sm font-medium text-slate-200">
                        {generationCopy.detail}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-black tracking-tight text-white">
                        {progress.percent}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400 to-emerald-300 transition-all duration-500"
                      style={{ width: `${Math.max(6, progress.percent)}%` }}
                    />
                  </div>

                  <p className="mt-4 text-xs leading-relaxed text-slate-500 sm:text-[13px]">
                    {t('aiScreen.progressFirstRunHint')}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/8 bg-white/5 p-5 sm:p-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-slate-500">
                    {t('aiScreen.progressRoadmapLabel')}
                  </p>
                  <div className="mt-4 space-y-3">
                    {generationStageCards.map((item) => (
                      <div
                        key={item.stage}
                        className={`rounded-2xl border px-4 py-3 transition ${
                          item.status === 'complete'
                            ? 'border-emerald-400/25 bg-emerald-400/8'
                            : item.status === 'active'
                              ? 'border-cyan-400/30 bg-cyan-400/8 shadow-[0_0_24px_rgba(0,240,255,0.08)]'
                              : 'border-white/8 bg-black/10'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-mono font-bold ${
                              item.status === 'complete'
                                ? 'border-emerald-400/35 bg-emerald-400/15 text-emerald-300'
                                : item.status === 'active'
                                  ? 'border-cyan-400/35 bg-cyan-400/15 text-cyan-300'
                                  : 'border-white/10 bg-white/5 text-slate-500'
                            }`}
                          >
                            {item.status === 'complete'
                              ? 'OK'
                              : item.status === 'active'
                                ? '...'
                                : '•'}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-white">{item.label}</p>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {item.status === 'complete'
                                ? t('aiScreen.progressStageComplete')
                                : item.status === 'active'
                                  ? t('aiScreen.progressStageActive')
                                  : t('aiScreen.progressStagePending')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* State C: Generated Briefing */}
      {screenState === 'generated' && (
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between gap-8 px-4 py-7 sm:px-6 md:py-12">
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
            </div>

            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              {t('aiScreen.resultsDesc')}
            </p>

            {scenarios.length < scenarioCount && (
              <div className="mt-4 border border-amber-500/30 bg-amber-500/5 px-4 py-3 rounded text-xs font-mono text-amber-300">
                {t('aiScreen.partialResult', {
                  gotScenarios: scenarios.length,
                  wantScenarios: scenarioCount,
                  gotCases: scenarios.length * 2,
                  wantCases: caseCount,
                })}
              </div>
            )}

            <div className="mt-8 space-y-4">
              {scenarios.map((s) => (
                <div key={s.id} className="rounded-lg border border-[#21262d] bg-[#111320] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {s.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500 font-medium">
                      {t('aiScreen.codeLabel')} {s.exceptionCode}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-black tracking-tight text-white">{s.title}</h3>
                  <div className="mt-3 grid grid-cols-1 gap-4 border-t border-[#21262d]/50 pt-3 font-mono text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
                    <div>
                      <span className="text-[10px] text-red-400/80 font-bold block mb-1">
                        {t('aiScreen.rivalEventLabel')}
                      </span>
                      <span className="block break-words text-slate-300">
                        {s.caseStudyA.subject} - {s.caseStudyA.act}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-emerald-300/80 font-bold block mb-1">
                        {t('aiScreen.allyEventLabel')}
                      </span>
                      <span className="block break-words text-slate-300">
                        {s.caseStudyB.subject} - {s.caseStudyB.act}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-t border-[#21262d] pt-2 lg:grid-cols-[minmax(0,1.15fr)_auto_auto] lg:items-center">
            <div className="flex items-start gap-3 rounded-xl border border-[#21262d] bg-[#0d1220] px-4 py-3 text-xs font-mono text-slate-500 shadow-lg">
              <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-300">
                <Zap size={14} className="fill-current" />
              </span>
              <span className="leading-relaxed">{t('aiScreen.unreleasedWarning')}</span>
            </div>
            <button
              type="button"
              onClick={() => setScreenState('setup')}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#30363d] bg-[#0c0f1c] px-5 py-3.5 font-mono text-xs font-black text-slate-200 transition hover:border-slate-500 hover:bg-[#121725] hover:text-white lg:min-w-[170px] lg:w-auto"
            >
              <RotateCcw size={14} />
              {t('aiScreen.resetSetup')}
            </button>
            <button
              type="button"
              onClick={handleStartJudging}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 to-cyan-400 px-5 py-3.5 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(34,211,238,0.22)] transition hover:from-cyan-200 hover:to-cyan-300 lg:min-w-[220px] lg:w-auto"
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
