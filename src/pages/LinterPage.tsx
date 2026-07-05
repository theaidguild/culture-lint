import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { JudgingStep } from '../components/JudgingStep'
import { RankingStep } from '../components/RankingStep'
import { SessionResultStep } from '../components/SessionResultStep'
import { SessionSetupStep } from '../components/SessionSetupStep'
import { TopBar } from '../components/TopBar'
import { getScenarioDatabase } from '../data/scenarios'
import { buildJudgmentSequence, evaluateInteractiveSession } from '../engine/linterEngine'
import { createRng, generateSeed, normalizeSeed, shuffleWithRng } from '../engine/random'
import {
  type InteractiveSessionRun,
  type JudgmentVerdict,
  type Principle,
  type ScenarioPreset,
} from '../types/linter'

type Step = 1 | 2 | 3 | 4

const DEFAULT_PRINCIPLE_ORDER = ['transparency', 'accountability', 'equality'] as const
const SEED_QUERY_PARAM = 'seed'
const SITUATION_COUNT_QUERY_PARAM = 'situations'
const SCENARIOS_QUERY_PARAM = 'scenarios'
const PRESET_QUERY_PARAM = 'preset'
const DEFAULT_SITUATION_COUNT = 8

const PRESET_MAPPINGS: Record<string, string[]> = {
  pais: [
    'fura-fila-saude',
    'perturbacao-sossego-comunidade',
    'alerta-fake-news-whatsapp',
    'furto-fome-supermercado',
    'mentira-politica-eleitor',
    'presente-agrado-reparticao',
    'cuidados-pais-idosos',
    'partilha-heranca-familiar',
  ],
  jovens: [
    'cancelamento-critica-influenciador',
    'divisao-conta-streaming',
    'meme-inteligencia-artificial',
    'trabalho-faculdade-credito',
    'alimentacao-vegana-boicote',
    'consumo-fast-fashion',
  ],
  biologos: [
    'pesquisa-cientifica-financiada',
    'especie-invasora-conservacao',
    'patente-remedio-indigena',
    'zoologico-conservacao-bem-estar',
    'divulgacao-cientifica-alerta',
    'coleta-especime-licenca',
  ],
  originais: [
    'inclusividade-seletiva',
    'cancelamento-do-bem',
    'stf-due-process',
    'corrupcao-estimada',
    'liberdade-expressao-seletiva',
    'seguranca-publica-seletiva',
    'vazamento-privacidade',
    'racismo-e-linguagem',
    'tolerancia-religiosa',
    'identidade-sexual-paradox',
  ],
}

const readSeedFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get(SEED_QUERY_PARAM)
  return raw ? normalizeSeed(raw) : null
}

const readPresetFromUrl = (): string => {
  if (typeof window === 'undefined') return 'todos'
  const raw = new URLSearchParams(window.location.search).get(PRESET_QUERY_PARAM)
  if (
    raw &&
    (raw === 'pais' ||
      raw === 'jovens' ||
      raw === 'biologos' ||
      raw === 'originais' ||
      raw === 'todos')
  ) {
    return raw
  }
  return 'todos'
}

const readForcedScenariosFromUrl = (): string[] | null => {
  if (typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get(SCENARIOS_QUERY_PARAM)
  return raw ? raw.split(',').map((id) => id.trim().toLowerCase()) : null
}

const writeParamsToUrl = (seed: string, preset: string) => {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set(SEED_QUERY_PARAM, seed)
  if (preset === 'todos') {
    url.searchParams.delete(PRESET_QUERY_PARAM)
  } else {
    url.searchParams.set(PRESET_QUERY_PARAM, preset)
  }
  window.history.replaceState(null, '', url.toString())
}

const parseSituationCount = (raw: string | null | undefined): number | null => {
  if (!raw) return null
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) return null
  return parsed
}

const clampSituationCount = (requestedCount: number, maxAvailableCount: number): number => {
  const clamped = Math.max(2, Math.min(requestedCount, maxAvailableCount))
  return clamped % 2 === 0 ? clamped : Math.max(2, clamped - 1)
}

const readConfiguredSituationCount = (): number => {
  if (typeof window !== 'undefined') {
    const fromQuery = parseSituationCount(
      new URLSearchParams(window.location.search).get(SITUATION_COUNT_QUERY_PARAM)
    )
    if (fromQuery !== null) return fromQuery
  }
  const fromEnv = parseSituationCount(import.meta.env['VITE_SITUATION_COUNT'])
  if (fromEnv !== null) return fromEnv
  return DEFAULT_SITUATION_COUNT
}

export function LinterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const principles = useMemo<Principle[]>(
    () => [
      {
        id: 'transparency',
        label: t('principles.transparency.label'),
        status: t('principles.transparency.status'),
        metadata: [
          t('principles.transparency.metadata.access'),
          t('principles.transparency.metadata.state'),
        ],
        value: t('principles.transparency.value'),
        code: 'CHK_012',
      },
      {
        id: 'accountability',
        label: t('principles.accountability.label'),
        status: t('principles.accountability.status'),
        metadata: [
          t('principles.accountability.metadata.resignation'),
          t('principles.accountability.metadata.state'),
        ],
        value: t('principles.accountability.value'),
        code: 'CHK_034',
      },
      {
        id: 'equality',
        label: t('principles.equality.label'),
        status: t('principles.equality.status'),
        metadata: [
          t('principles.equality.metadata.payGap'),
          t('principles.equality.metadata.state'),
        ],
        value: t('principles.equality.value'),
        code: 'CHK_088',
      },
    ],
    [t]
  )

  const scenarioDatabase = useMemo(() => getScenarioDatabase(t), [t])
  const maxSituationCount = useMemo(() => scenarioDatabase.length * 2, [scenarioDatabase])
  const configuredSituationCount = useMemo(
    () => clampSituationCount(readConfiguredSituationCount(), maxSituationCount),
    [maxSituationCount]
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
  const [preset, setPreset] = useState<string>(() => readPresetFromUrl())
  const [answers, setAnswers] = useState<Record<string, JudgmentVerdict>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [session, setSession] = useState<InteractiveSessionRun | null>(null)
  const analyzeTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    writeParamsToUrl(seed, preset)
  }, [seed, preset])

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

  // React to Home button clicks from the sidebar (fires location.state.reset).
  useEffect(() => {
    const state = location.state as { reset?: boolean } | null
    if (state?.reset) {
      if (analyzeTimeoutRef.current !== undefined) {
        window.clearTimeout(analyzeTimeoutRef.current)
        analyzeTimeoutRef.current = undefined
      }
      /* eslint-disable react-hooks/set-state-in-effect */
      setStep(1)
      setPrincipleRanking([...DEFAULT_PRINCIPLE_ORDER])
      setAnswers({})
      setCurrentIndex(0)
      setIsAnalyzing(false)
      setSession(null)
      /* eslint-enable react-hooks/set-state-in-effect */
      navigate('/', { replace: true, state: null })
    }
  }, [location.state, navigate])

  const rankedPrinciples = useMemo(
    () =>
      principleRanking
        .map((id) => principleById.get(id))
        .filter((principle): principle is Principle => Boolean(principle)),
    [principleById, principleRanking]
  )

  const activeScenarios = useMemo(() => {
    const forcedIds = readForcedScenariosFromUrl()
    if (forcedIds && forcedIds.length > 0) {
      const filtered: ScenarioPreset[] = []
      for (const id of forcedIds) {
        const found = scenarioDatabase.find((s) => s.id === id)
        if (found) filtered.push(found)
      }
      if (filtered.length > 0) return filtered
    }

    if (
      preset === 'pais' ||
      preset === 'jovens' ||
      preset === 'biologos' ||
      preset === 'originais'
    ) {
      const mappedIds = PRESET_MAPPINGS[preset]
      if (mappedIds) {
        const filtered = scenarioDatabase.filter((s) => mappedIds.includes(s.id))
        if (filtered.length > 0) return filtered
      }
    }

    const requestedScenarioCount = Math.max(1, Math.floor(configuredSituationCount / 2))
    const shuffledScenarios = shuffleWithRng(
      scenarioDatabase,
      createRng(`${seed}:scenario-selection`)
    )
    return shuffledScenarios.slice(0, requestedScenarioCount)
  }, [configuredSituationCount, scenarioDatabase, seed, preset])

  const judgmentSequence = useMemo(
    () => buildJudgmentSequence({ seed, scenarios: activeScenarios }),
    [activeScenarios, seed]
  )

  const progressItems = useMemo(
    () => [
      { label: t('progress.rankPrinciples'), active: step === 1, complete: step > 1 },
      { label: t('progress.sessionSeed'), active: step === 2, complete: step > 2 },
      { label: t('progress.judgment'), active: step === 3, complete: step > 3 },
      { label: t('progress.sessionResults'), active: step === 4, complete: false },
    ],
    [step, t]
  )

  const activeComplication = useMemo(() => {
    const currentItem = judgmentSequence[currentIndex]
    if (!currentItem) return undefined
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
    if (!currentItem) return
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

  return (
    <>
      <TopBar
        progressItems={progressItems}
        step={step}
        hasFailures={Boolean(session && (session.contradictionCount > 0 || session.isFlatLineVote))}
      />
      {step === 1 && (
        <RankingStep
          principles={rankedPrinciples}
          onReorder={handleReorder}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <SessionSetupStep
          seed={seed}
          itemCount={judgmentSequence.length}
          onSeedChange={handleSeedChange}
          onNewSeed={handleNewSeed}
          onBack={() => setStep(1)}
          onStart={beginJudging}
          currentPreset={preset}
          onPresetChange={(presetId) => {
            setPreset(presetId)
            setAnswers({})
            setCurrentIndex(0)
            setSession(null)
          }}
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
    </>
  )
}

export default LinterPage
