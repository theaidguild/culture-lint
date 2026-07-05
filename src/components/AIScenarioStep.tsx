import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  Globe,
  Settings2,
  Layers,
  Flame,
  CheckCircle2,
  Terminal,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react'
import { generateAIScenarios, SUPPORTED_COUNTRIES } from '../services/aiScenarioGenerator'
import {
  type ScenarioPreset,
  type JudgmentItem,
  type JudgmentVerdict,
  type InteractiveSessionRun,
  type Principle,
} from '../types/linter'
import { buildJudgmentSequence, evaluateInteractiveSession } from '../engine/linterEngine'
import { JudgingStep } from './JudgingStep'
import { SessionResultStep } from './SessionResultStep'

interface AIScenarioStepProps {
  principles: Principle[]
}

type AIScreenState = 'setup' | 'generating' | 'generated' | 'judging' | 'results'

export function AIScenarioStep({ principles }: AIScenarioStepProps) {
  const { t, i18n } = useTranslation()
  const isPt = i18n.language === 'pt-BR'

  // 1. Setup Form States
  const [selectedCountry, setSelectedCountry] = useState('BR')
  const [selectedPrincipleIds, setSelectedPrincipleIds] = useState<string[]>(['equality'])
  const [caseCount, setCaseCount] = useState(6)

  // State Machine
  const [screenState, setScreenState] = useState<AIScreenState>('setup')
  const [scenarios, setScenarios] = useState<ScenarioPreset[]>([])
  const [generationLogs, setGenerationLogs] = useState<string[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // 2. Playback States
  const [judgmentSequence, setJudgmentSequence] = useState<JudgmentItem[]>([])
  const [answers, setAnswers] = useState<Record<string, JudgmentVerdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionResult, setSessionResult] = useState<InteractiveSessionRun | null>(null)

  const activeLogTimer = useRef<number | undefined>(undefined)
  const analysisTimeoutRef = useRef<number | undefined>(undefined)
  const scenarioCount = Math.max(1, caseCount / 2)

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
      if (activeLogTimer.current) window.clearTimeout(activeLogTimer.current)
      if (analysisTimeoutRef.current) window.clearTimeout(analysisTimeoutRef.current)
    }
  }, [])

  // Start Generation Process
  const handleGenerate = async () => {
    setScreenState('generating')
    setErrorMessage(null)
    setScenarios([])
    setGenerationLogs([])

    const selectedPrincipleNames = principles
      .filter((principle) => selectedPrinciples.includes(principle.id))
      .map((principle) => principle.label)

    // Simulated high-tech cyber-compiler logs
    const logPhrases = [
      t('aiScreen.generatingLog1'),
      `[HTTP/443] discourse.com/stream/v1/${selectedCountry.toLowerCase()} . OK`,
      t('aiScreen.generatingLog2'),
      '// Extracting in-group / out-group conflict matrices...',
      `// Active Principle constraints loaded: ${(selectedPrincipleNames.join(' + ') || selectedPrinciples.join(' + ')).toUpperCase()}`,
      t('aiScreen.generatingLog3'),
      '// Symmetrical semantic trees generated.',
      t('aiScreen.generatingLog4'),
      '// Injecting volatility and cognitive friction parameters...',
      '// Compiler selected execution path: ON-DEVICE-WASM',
    ]

    let currentLogIndex = 0
    const printNextLog = () => {
      if (currentLogIndex < logPhrases.length) {
        setGenerationLogs((prev) => [...prev, logPhrases[currentLogIndex]])
        currentLogIndex++
        activeLogTimer.current = window.setTimeout(printNextLog, 300 + Math.random() * 150)
      } else {
        // Trigger the actual generation
        void triggerAPIGeneration()
      }
    }

    printNextLog()
  }

  // Real fetch and assignment
  const triggerAPIGeneration = async () => {
    try {
      const generated = await generateAIScenarios({
        countryCode: selectedCountry,
        language: i18n.language as 'en-US' | 'pt-BR',
        principleIds: selectedPrinciples,
        count: scenarioCount,
        onProgress: (_pct, label) => {
          setGenerationLogs((prev) => {
            const nextLogs = [...prev]
            const lastLog = nextLogs[nextLogs.length - 1]
            // If the last log starts with '[TRANSFORMERS PROGRESS]', update it
            if (
              lastLog &&
              typeof lastLog === 'string' &&
              lastLog.startsWith('[TRANSFORMERS PROGRESS]')
            ) {
              nextLogs[nextLogs.length - 1] = `[TRANSFORMERS PROGRESS] -> ${label}`
            } else {
              nextLogs.push(`[TRANSFORMERS PROGRESS] -> ${label}`)
            }
            return nextLogs
          })
        },
      })

      if (generated.length === 0) {
        throw new Error('No scenarios could be generated.')
      }

      setScenarios(generated)
      setScreenState('generated')
    } catch (err: unknown) {
      console.error(err)
      const errMsg = err instanceof Error ? err.message : String(err)
      setErrorMessage(errMsg || t('aiScreen.generationFailed'))
      setScreenState('setup')
    }
  }

  // Enter Play Mode
  const handleStartJudging = () => {
    // Shuffled sequence based on scenarios and a random seed
    const activeSeed = Math.random().toString(36).substring(7).toUpperCase()
    const seq = buildJudgmentSequence({ seed: activeSeed, scenarios })
    setJudgmentSequence(seq)
    setAnswers({})
    setCurrentIndex(0)
    setSessionResult(null)
    setScreenState('judging')
  }

  // Handle a user verdict
  const handleVerdict = (verdict: JudgmentVerdict) => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) return

    const nextAnswers = { ...answers, [currentItem.id]: verdict }
    setAnswers(nextAnswers)

    if (currentIndex >= judgmentSequence.length - 1) {
      // Analyze findings
      setIsAnalyzing(true)
      analysisTimeoutRef.current = window.setTimeout(() => {
        const resolvedPrinciple = (id: string) => {
          return principles.find((p) => p.id === id) || principles[0]
        }

        // We rank the selected principle first for visual focus
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

  // Complications injected dynamically based on mirroring
  const activeComplication = useMemo(() => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) return undefined

    const siblingCaseKey = currentItem.caseKey === 'A' ? 'B' : 'A'
    const siblingId = `${currentItem.scenarioId}:${siblingCaseKey}`
    const siblingVerdict = answers[siblingId]

    if (siblingVerdict) {
      const verdictCapitalized = siblingVerdict === 'ACCEPTABLE' ? 'Acceptable' : 'Outrageous'
      // Try to read custom complications, or fallback to a standard dynamic escalation
      const customComp = (currentItem as { complications?: Record<string, string> })
        .complications?.[`if${verdictCapitalized}`]
      if (customComp) return customComp

      return languageNeutralComplication(verdictCapitalized, i18n.language)
    }
    return undefined
  }, [currentIndex, judgmentSequence, answers, i18n.language])

  // Simple clean fallback complications since LLM could omit complication messages
  function languageNeutralComplication(choice: string, lang: string) {
    const isPt = lang === 'pt-BR'
    return isPt
      ? `Você julgou o ato simétrico anterior como ${choice === 'Acceptable' ? 'ACEITÁVEL' : 'ULTRAJANTE'}. Como consequência de sua consistência prévia, a IA injetou volatilidade: subsequentes permissões enfraquecem regras sistêmicas universais.`
      : `You judged the previous symmetric act as ${choice.toUpperCase()}. In response, the compiler injected volatility: subsequent tolerances weaken universal systemic resilience.`
  }

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

  return (
    <div className="flex-1 bg-[#0a0c10] text-slate-100 flex flex-col justify-start">
      {/* State A: Setup */}
      {screenState === 'setup' && (
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 sm:px-6 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles size={20} />
            </span>
            <div>
              <h1 className="text-2xl font-black md:text-3xl text-white tracking-tight">
                {t('aiScreen.title')}
              </h1>
              <p className="text-xs font-mono text-cyan-400/80 mt-1 uppercase tracking-wider">
                {t('aiScreen.subtitle')}
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-3xl">
            {t('aiScreen.description')}
          </p>

          {errorMessage && (
            <div className="mt-6 border border-red-500/30 bg-red-500/5 px-4 py-3 rounded text-xs font-mono text-red-400">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] gap-6 xl:gap-8 items-start">
            {/* Left Column: Core Setup */}
            <div className="bg-[#111320] border border-[#21262d] p-5 sm:p-6 rounded-lg space-y-6 shadow-xl">
              <div>
                <label className="block mb-2 font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Globe size={13} className="text-cyan-400" />
                  {t('aiScreen.countryLabel')}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
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
                  {[4, 6, 8].map((cases) => (
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
            </div>

            {/* Right Column: Execution info */}
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
          <div className="w-full max-w-2xl bg-[#03060c] border border-cyan-400/20 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.08)] flex flex-col h-[400px]">
            <header className="border-b border-[#21262d] bg-cyan-400/5 px-4 py-3 flex items-center justify-between font-mono text-xs text-cyan-300 select-none">
              <span className="flex items-center gap-1.5 animate-pulse font-bold">
                <Terminal size={14} />
                {t('aiScreen.generatingTitle')}
              </span>
              <span className="text-slate-500">v2026.3.2 // active</span>
            </header>
            <div className="flex-1 overflow-y-auto px-4 py-4 font-mono text-xs leading-relaxed space-y-1 bg-[#010409]">
              {generationLogs.map((log, idx) => (
                <div key={idx} className="flex gap-2">
                  <span className="text-cyan-500/60 font-bold select-none">[v]</span>
                  <span
                    className={
                      log && typeof log === 'string' && log.startsWith('//')
                        ? 'text-slate-500'
                        : 'text-slate-300'
                    }
                  >
                    {log}
                  </span>
                </div>
              ))}
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
              <div>
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

      {/* State D: Play gauntlet (JudgingStep) */}
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

      {/* State E: Results (SessionResultStep) */}
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
