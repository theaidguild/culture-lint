import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { JudgingStep } from './components/JudgingStep'
import { RankingStep } from './components/RankingStep'
import { SessionResultStep } from './components/SessionResultStep'
import { SessionSetupStep } from './components/SessionSetupStep'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { getScenarioDatabase } from './data/scenarios'
import { buildJudgmentSequence, evaluateInteractiveSession } from './engine/linterEngine'
import { createRng, generateSeed, normalizeSeed, shuffleWithRng } from './engine/random'
import {
  type InteractiveSessionRun,
  type JudgmentVerdict,
  type Principle,
} from './types/linter'

type Step = 1 | 2 | 3 | 4

const DEFAULT_PRINCIPLE_ORDER = ['transparency', 'accountability', 'equality'] as const
const SEED_QUERY_PARAM = 'seed'
const SITUATION_COUNT_QUERY_PARAM = 'situations'
const DEFAULT_SITUATION_COUNT = 8

const readSeedFromUrl = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = new URLSearchParams(window.location.search).get(SEED_QUERY_PARAM)
  return raw ? normalizeSeed(raw) : null
}

const writeSeedToUrl = (seed: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const url = new URL(window.location.href)
  url.searchParams.set(SEED_QUERY_PARAM, seed)
  window.history.replaceState(null, '', url.toString())
}

const parseSituationCount = (raw: string | null | undefined): number | null => {
  if (!raw) {
    return null
  }

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return null
  }

  return parsed
}

const clampSituationCount = (requestedCount: number, maxAvailableCount: number): number => {
  const clamped = Math.max(2, Math.min(requestedCount, maxAvailableCount))
  return clamped % 2 === 0 ? clamped : Math.max(2, clamped - 1)
}

const readConfiguredSituationCount = (): number => {
  if (typeof window !== 'undefined') {
    const fromQuery = parseSituationCount(new URLSearchParams(window.location.search).get(SITUATION_COUNT_QUERY_PARAM))
    if (fromQuery !== null) {
      return fromQuery
    }
  }

  const fromEnv = parseSituationCount(import.meta.env['VITE_SITUATION_COUNT'])
  if (fromEnv !== null) {
    return fromEnv
  }

  return DEFAULT_SITUATION_COUNT
}

function App() {
  const { t } = useTranslation()

  const principles = useMemo<Principle[]>(
    () => [
      {
        id: 'transparency',
        label: t('principles.transparency.label'),
        status: t('principles.transparency.status'),
        metadata: [t('principles.transparency.metadata.access'), t('principles.transparency.metadata.state')],
        value: t('principles.transparency.value'),
        code: 'CHK_012',
      },
      {
        id: 'accountability',
        label: t('principles.accountability.label'),
        status: t('principles.accountability.status'),
        metadata: [t('principles.accountability.metadata.resignation'), t('principles.accountability.metadata.state')],
        value: t('principles.accountability.value'),
        code: 'CHK_034',
      },
      {
        id: 'equality',
        label: t('principles.equality.label'),
        status: t('principles.equality.status'),
        metadata: [t('principles.equality.metadata.payGap'), t('principles.equality.metadata.state')],
        value: t('principles.equality.value'),
        code: 'CHK_088',
      },
    ],
    [t],
  )

  const scenarioDatabase = useMemo(() => getScenarioDatabase(t), [t])
  const maxSituationCount = useMemo(() => scenarioDatabase.length * 2, [scenarioDatabase])
  const configuredSituationCount = useMemo(
    () => clampSituationCount(readConfiguredSituationCount(), maxSituationCount),
    [maxSituationCount],
  )

  const principleById = useMemo(() => {
    const lookup = new Map<string, Principle>()
    for (const principle of principles) {
      lookup.set(principle.id, principle)
    }
    return lookup
  }, [principles])

  const [step, setStep] = useState<Step>(1)
  const [principleRanking, setPrincipleRanking] = useState<string[]>([...DEFAULT_PRINCIPLE_ORDER])
  const [seed, setSeed] = useState<string>(() => readSeedFromUrl() ?? generateSeed())
  const [answers, setAnswers] = useState<Record<string, JudgmentVerdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [session, setSession] = useState<InteractiveSessionRun | null>(null)
  const analyzeTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    writeSeedToUrl(seed)
  }, [seed])

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current !== undefined) {
        window.clearTimeout(analyzeTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [step, currentIndex])

  const rankedPrinciples = useMemo(
    () =>
      principleRanking
        .map((id) => principleById.get(id))
        .filter((principle): principle is Principle => Boolean(principle)),
    [principleById, principleRanking],
  )

  const activeScenarios = useMemo(() => {
    const requestedScenarioCount = Math.max(1, Math.floor(configuredSituationCount / 2))
    const shuffledScenarios = shuffleWithRng(scenarioDatabase, createRng(`${seed}:scenario-selection`))
    return shuffledScenarios.slice(0, requestedScenarioCount)
  }, [configuredSituationCount, scenarioDatabase, seed])

  const judgmentSequence = useMemo(
    () => buildJudgmentSequence({ seed, scenarios: activeScenarios }),
    [activeScenarios, seed],
  )

  const progressItems = useMemo(
    () => [
      { label: t('progress.rankPrinciples'), active: step === 1, complete: step > 1 },
      { label: t('progress.sessionSeed'), active: step === 2, complete: step > 2 },
      { label: t('progress.judgment'), active: step === 3, complete: step > 3 },
      { label: t('progress.sessionResults'), active: step === 4, complete: false },
    ],
    [step, t],
  )

  const activeComplication = useMemo(() => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) {
      return undefined
    }

    const siblingCaseKey = currentItem.caseKey === 'A' ? 'B' : 'A'
    const siblingId = `${currentItem.scenarioId}:${siblingCaseKey}`
    const siblingVerdict = answers[siblingId]

    if (siblingVerdict) {
      const verdictCapitalized = siblingVerdict === 'ACCEPTABLE' ? 'Acceptable' : 'Outrageous'
      return t(`scenarios.${currentItem.scenarioId}.complications.if${verdictCapitalized}`)
    }
    return undefined
  }, [currentIndex, judgmentSequence, answers, t])

  const activeAntiGamingWarning = useMemo(() => {
    if (currentIndex < 3) {
      return undefined
    }

    const lastThree = judgmentSequence.slice(currentIndex - 3, currentIndex).map((item) => answers[item.id])
    const allAcceptable = lastThree.every((val) => val === 'ACCEPTABLE')
    const allOutrageous = lastThree.every((val) => val === 'OUTRAGEOUS')

    if (allAcceptable) {
      return t('judge.antiGamingAcceptable')
    }
    if (allOutrageous) {
      return t('judge.antiGamingOutrageous')
    }

    return undefined
  }, [currentIndex, judgmentSequence, answers, t])

  const beginJudging = () => {
    setAnswers({})
    setCurrentIndex(0)
    setSession(null)
    setStep(3)
  }

  const analyzeAndFinish = (finalAnswers: Record<string, JudgmentVerdict>, activeSeed: string) => {
    setIsAnalyzing(true)
    if (analyzeTimeoutRef.current !== undefined) {
      window.clearTimeout(analyzeTimeoutRef.current)
    }

    analyzeTimeoutRef.current = window.setTimeout(() => {
      const result = evaluateInteractiveSession({
        seed: activeSeed,
        principleRanking,
        scenarios: activeScenarios,
        answers: finalAnswers,
        resolvePrinciple: (principleId) => principleById.get(principleId) ?? principles[0],
      })

      setSession(result)
      setIsAnalyzing(false)
      setStep(4)
      analyzeTimeoutRef.current = undefined
    }, 1500)
  }

  const handleVerdict = (verdict: JudgmentVerdict) => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) {
      return
    }

    const nextAnswers = { ...answers, [currentItem.id]: verdict }
    setAnswers(nextAnswers)

    if (currentIndex >= judgmentSequence.length - 1) {
      analyzeAndFinish(nextAnswers, seed)
      return
    }

    setCurrentIndex((index) => index + 1)
  }

  const handleBack = () => {
    setCurrentIndex((index) => Math.max(0, index - 1))
  }

  const handleReorder = (nextOrder: string[]) => {
    setPrincipleRanking(nextOrder)
    setSession(null)
  }

  const handleSeedChange = (value: string) => {
    setSeed(normalizeSeed(value))
    setAnswers({})
    setCurrentIndex(0)
    setSession(null)
  }

  const handleNewSeed = () => {
    setSeed(generateSeed())
    setAnswers({})
    setCurrentIndex(0)
    setSession(null)
  }

  const restartWithNewSeed = () => {
    const nextSeed = generateSeed()
    setSeed(nextSeed)
    setAnswers({})
    setCurrentIndex(0)
    setSession(null)
    setStep(3)
  }

  const resetToInitialState = () => {
    if (analyzeTimeoutRef.current !== undefined) {
      window.clearTimeout(analyzeTimeoutRef.current)
      analyzeTimeoutRef.current = undefined
    }

    setStep(1)
    setPrincipleRanking([...DEFAULT_PRINCIPLE_ORDER])
    setAnswers({})
    setCurrentIndex(0)
    setIsAnalyzing(false)
    setSession(null)
  }

  return (
    <main className="safe-screen min-h-dvh overflow-x-clip bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-70 sm:opacity-100" />
      <div className="relative flex min-h-dvh flex-col md:flex-row">
        <Sidebar onHomeClick={resetToInitialState} />
        <section className="flex min-h-dvh flex-1 flex-col border-t border-[#21262d] bg-[#0d1117]/95 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-24 md:border-l md:border-t-0 md:pb-0">
          <TopBar progressItems={progressItems} step={step} hasFailures={Boolean(session && (session.contradictionCount > 0 || session.isFlatLineVote))} />
          {step === 1 && (
            <RankingStep principles={rankedPrinciples} onReorder={handleReorder} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <SessionSetupStep
              seed={seed}
              itemCount={judgmentSequence.length}
              onSeedChange={handleSeedChange}
              onNewSeed={handleNewSeed}
              onBack={() => setStep(1)}
              onStart={beginJudging}
            />
          )}
          {step === 3 && (
            <JudgingStep
              item={judgmentSequence[currentIndex]}
              index={currentIndex}
              total={judgmentSequence.length}
              isAnalyzing={isAnalyzing}
              canGoBack={currentIndex > 0}
              activeComplication={activeComplication}
              activeAntiGamingWarning={activeAntiGamingWarning}
              onVerdict={handleVerdict}
              onBack={handleBack}
            />
          )}
          {step === 4 && session && (
            <SessionResultStep
              session={session}
              principles={principles}
              onRerunSameSeed={beginJudging}
              onNewSeedRun={restartWithNewSeed}
            />
          )}
        </section>
      </div>
    </main>
  )
}

export default App

