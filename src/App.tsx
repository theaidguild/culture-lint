import { Check, FileCode2, Home, Lock, Settings, ShieldCheck, Terminal, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getScenarioDatabase } from './data/scenarios'
import { runCultureLint, type LintRunResult } from './engine/linterEngine'
import { type Principle, type ScenarioPreset } from './types/linter'

type Step = 1 | 2 | 3

type CaseStudyKey = 'eventA' | 'eventB'

type CaseStudy = {
  subject: string
  act: string
  context: string
}

type CaseStudies = Record<CaseStudyKey, CaseStudy>
type CaseStudyDrafts = Record<string, CaseStudies>

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

  const [step, setStep] = useState<Step>(1)
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [caseStudyDrafts, setCaseStudyDrafts] = useState<CaseStudyDrafts>({})
  const [isCompiling, setIsCompiling] = useState(false)
  const [lintResult, setLintResult] = useState<LintRunResult | null>(null)
  const compileTimeoutRef = useRef<number | undefined>(undefined)

  const lockedPrinciple = selectedPrinciple ?? principles[1]
  const principleScenarios = useMemo(
    () => scenarioDatabase.filter((scenario) => scenario.principleId === lockedPrinciple.id),
    [lockedPrinciple.id, scenarioDatabase],
  )

  const activeScenario = useMemo(
    () =>
      principleScenarios.find((scenario) => scenario.id === selectedScenarioId) ?? principleScenarios[0] ?? scenarioDatabase[0],
    [principleScenarios, scenarioDatabase, selectedScenarioId],
  )

  const caseStudies = useMemo<CaseStudies>(() => {
    const draft = caseStudyDrafts[activeScenario.id]
    if (draft) {
      return draft
    }

    return {
      eventA: {
        subject: activeScenario.caseStudyA.subject,
        act: activeScenario.caseStudyA.act,
        context: activeScenario.caseStudyA.context,
      },
      eventB: {
        subject: activeScenario.caseStudyB.subject,
        act: activeScenario.caseStudyB.act,
        context: activeScenario.caseStudyB.context,
      },
    }
  }, [activeScenario, caseStudyDrafts])

  const progressItems = useMemo(
    () => [
      { label: t('progress.biasDetection'), active: step === 1, complete: step > 1 },
      { label: t('progress.metadataAssignment'), active: step === 2, complete: step > 2 },
      { label: t('progress.resultAnalysis'), active: step === 3, complete: false },
    ],
    [step, t],
  )

  const updateCaseStudy = (caseKey: CaseStudyKey, field: keyof CaseStudy, value: string) => {
    setCaseStudyDrafts((current) => {
      const scenarioDraft = current[activeScenario.id] ?? {
        eventA: {
          subject: activeScenario.caseStudyA.subject,
          act: activeScenario.caseStudyA.act,
          context: activeScenario.caseStudyA.context,
        },
        eventB: {
          subject: activeScenario.caseStudyB.subject,
          act: activeScenario.caseStudyB.act,
          context: activeScenario.caseStudyB.context,
        },
      }

      return {
        ...current,
        [activeScenario.id]: {
          ...scenarioDraft,
          [caseKey]: {
            ...scenarioDraft[caseKey],
            [field]: value,
          },
        },
      }
    })
  }

  useEffect(() => {
    return () => {
      if (compileTimeoutRef.current !== undefined) {
        window.clearTimeout(compileTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [step])

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId)
    setLintResult(null)
  }

  const handlePrincipleSelect = (principle: Principle) => {
    setSelectedPrinciple(principle)
    setLintResult(null)
  }

  const compileCaseStudy = () => {
    if (compileTimeoutRef.current !== undefined) {
      window.clearTimeout(compileTimeoutRef.current)
    }

    setIsCompiling(true)
    compileTimeoutRef.current = window.setTimeout(() => {
      const runtimeScenario: ScenarioPreset = {
        ...activeScenario,
        caseStudyA: {
          ...activeScenario.caseStudyA,
          subject: caseStudies.eventA.subject,
          act: caseStudies.eventA.act,
          context: caseStudies.eventA.context,
        },
        caseStudyB: {
          ...activeScenario.caseStudyB,
          subject: caseStudies.eventB.subject,
          act: caseStudies.eventB.act,
          context: caseStudies.eventB.context,
        },
      }

      setLintResult(
        runCultureLint(lockedPrinciple, runtimeScenario, {
          formatReactionMutationDescription: ({ fromReaction, toReaction }) =>
            t('errors.reactionMutation', {
              fromReaction,
              toReaction,
            }),
        }),
      )
      compileTimeoutRef.current = undefined
      setIsCompiling(false)
      setStep(3)
    }, 1500)
  }

  const resetToInitialState = () => {
    if (compileTimeoutRef.current !== undefined) {
      window.clearTimeout(compileTimeoutRef.current)
      compileTimeoutRef.current = undefined
    }

    setStep(1)
    setSelectedPrinciple(null)
    setSelectedScenarioId(null)
    setCaseStudyDrafts({})
    setIsCompiling(false)
    setLintResult(null)
  }

  return (
    <main className="safe-screen min-h-dvh overflow-x-clip bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-70 sm:opacity-100" />
      <div className="relative flex min-h-dvh flex-col md:flex-row">
        <Sidebar onHomeClick={resetToInitialState} />
        <section className="flex min-h-dvh flex-1 flex-col border-t border-[#21262d] bg-[#0d1117]/95 pb-20 md:border-l md:border-t-0 md:pb-0">
          <TopBar progressItems={progressItems} step={step} />
          {step === 1 && (
            <PrincipleStep
              principles={principles}
              selectedPrinciple={selectedPrinciple}
              onSelect={handlePrincipleSelect}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <MetadataStep
              caseStudies={caseStudies}
              scenarios={principleScenarios}
              activeScenarioId={activeScenario.id}
              isCompiling={isCompiling}
              onChange={updateCaseStudy}
              onScenarioChange={handleScenarioChange}
              onCompile={compileCaseStudy}
            />
          )}
          {step === 3 && <ResultStep principle={lockedPrinciple} caseStudies={caseStudies} scenario={activeScenario} lintResult={lintResult} />}
        </section>
      </div>
    </main>
  )
}

function Sidebar({ onHomeClick }: { onHomeClick: () => void }) {
  const { t } = useTranslation()

  return (
    <>
      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-20 border-t border-[#21262d] bg-[#07090d]/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className="grid h-11 w-11 place-items-center rounded-md text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <Home size={18} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <FileCode2 size={18} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Terminal size={18} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={18} />
          </span>
        </div>
      </nav>
      <aside className="hidden w-14 flex-col items-center border-r border-[#21262d] bg-[#07090d] py-6 text-slate-500 md:flex">
        <div className="mb-9 rounded-md border border-cyan-400/60 p-1 text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.28)]">
          <ShieldCheck size={16} />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <button
            type="button"
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className="grid h-11 w-11 place-items-center rounded-md text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <Home size={17} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <FileCode2 size={17} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Terminal size={17} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={17} />
          </span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(255,123,114,0.9)]" />
      </aside>
    </>
  )
}

function TopBar({ progressItems, step }: { progressItems: { label: string; active: boolean; complete: boolean }[]; step: Step }) {
  const { t, i18n } = useTranslation()
  const activeStep = step

  return (
    <header className="compact-header flex min-h-16 flex-wrap items-center justify-between gap-y-3 border-b border-[#21262d] bg-[#0b0d17] px-4 py-3 text-sm text-slate-400 sm:px-5 md:h-16 md:flex-nowrap md:py-0 lg:px-9">
      <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
        <span className="rounded-sm bg-cyan-400 px-1.5 py-1 text-xs text-[#071018]">C</span>
        <span className="text-xs sm:text-sm">{t('appName')}</span>
      </div>
      <div className="rounded border border-[#30363d] px-3 py-1.5 font-mono text-xs text-slate-300 md:hidden">
        {`Step ${activeStep} / 3`}
      </div>
      <nav className="hidden items-center gap-6 md:flex">
        {progressItems.map((item, index) => (
          <div key={item.label} className={`flex items-center gap-2 ${item.active ? 'text-cyan-300' : item.complete ? 'text-emerald-400' : ''}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full border text-xs ${item.active ? 'border-cyan-300 bg-cyan-300 text-[#071018]' : item.complete ? 'border-emerald-400' : 'border-slate-700'}`}>
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
        {step === 3 && <span className="rounded border border-red-500/70 px-2 py-1 text-xs text-red-400 sm:px-3">{t('topbar.compileFailed')}</span>}
        <span className="hidden lg:inline">{t('topbar.analyst')}</span>
        <span className="hidden h-7 w-7 rounded-full bg-indigo-500/25 lg:block" />
      </div>
    </header>
  )
}

function PrincipleStep({
  principles,
  selectedPrinciple,
  onSelect,
  onNext,
}: {
  principles: Principle[]
  selectedPrinciple: Principle | null
  onSelect: (principle: Principle) => void
  onNext: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-1 items-start px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-7xl">
        <div className="mb-8 font-mono text-xs text-slate-500 sm:mb-10">
          {t('step1.progress')}
          <div className="mt-3 flex gap-2">
            <span className="h-0.5 w-10 bg-cyan-400" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">{t('step1.title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">
          {t('step1.description')}
        </p>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 2xl:grid-cols-3">
          {principles.map((principle) => {
            const active = selectedPrinciple?.id === principle.id
            return (
              <button
                key={principle.id}
                type="button"
                onClick={() => onSelect(principle)}
                className={`group min-h-64 rounded-xl border bg-[#161b22] p-5 text-left transition duration-300 sm:min-h-72 sm:p-6 ${active ? 'border-emerald-400 shadow-[0_0_35px_rgba(86,211,100,0.18)]' : 'border-[#21262d] hover:border-cyan-400/50'}`}
              >
                <div className="flex items-start justify-between font-mono text-xs">
                  <span className={active ? 'text-emerald-300' : 'text-slate-400'}>{active ? t('step1.selected') : principle.status}</span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-emerald-400 bg-emerald-400 text-[#071018]' : 'border-[#30363d]'}`}>
                    {active && <Check size={13} />}
                  </span>
                </div>
                <div className="mt-12 space-y-1 font-mono text-sm text-cyan-400 sm:mt-16">
                  {principle.metadata.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <p className="mt-8 text-base font-black italic leading-7 text-white sm:mt-10 sm:text-lg">&quot;{principle.value}&quot;</p>
                <div className="mt-10 h-px bg-[#21262d] sm:mt-12" />
                <p className="mt-2 text-right font-mono text-xs text-slate-400">{principle.code}</p>
              </button>
            )
          })}
        </div>
        <div className="mt-10 flex justify-end sm:mt-12">
          <button
            type="button"
            disabled={!selectedPrinciple}
            onClick={onNext}
            className="w-full rounded-md bg-cyan-400 px-8 py-4 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:w-auto"
          >
            {t('step1.next')}
          </button>
        </div>
      </div>
    </div>
  )
}

function MetadataStep({
  caseStudies,
  scenarios,
  activeScenarioId,
  isCompiling,
  onChange,
  onScenarioChange,
  onCompile,
}: {
  caseStudies: CaseStudies
  scenarios: ScenarioPreset[]
  activeScenarioId: string
  isCompiling: boolean
  onChange: (caseKey: CaseStudyKey, field: keyof CaseStudy, value: string) => void
  onScenarioChange: (scenarioId: string) => void
  onCompile: () => void
}) {
  const { t } = useTranslation()
  const [scenarioQuery, setScenarioQuery] = useState('')
  const normalizedQuery = scenarioQuery.trim().toLowerCase()
  const filteredScenarios = useMemo(() => {
    if (!normalizedQuery) {
      return scenarios
    }

    return scenarios.filter((scenario) => {
      const haystack = `${scenario.title} ${scenario.category} ${scenario.id} ${scenario.exceptionCode} ${scenario.exceptionType}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [normalizedQuery, scenarios])

  useEffect(() => {
    if (filteredScenarios.length === 0) {
      return
    }

    if (!filteredScenarios.some((scenario) => scenario.id === activeScenarioId)) {
      onScenarioChange(filteredScenarios[0].id)
    }
  }, [activeScenarioId, filteredScenarios, onScenarioChange])

  const selectedScenario = scenarios.find((scenario) => scenario.id === activeScenarioId) ?? scenarios[0]

  return (
    <div className="flex flex-1 items-start justify-center px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-6xl">
        <p className="font-mono text-sm text-slate-400">{t('step2.armed')}</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{t('step2.title')}</h1>
        <p className="mt-4 text-sm text-slate-400">{t('step2.description')}</p>
        <div className="mt-8 rounded-lg border border-[#21262d] bg-[#111320] p-4 sm:p-5">
          <label className="block">
            <span className="font-mono text-sm font-black text-cyan-300">{t('step2.filterPresets')}</span>
            <input
              value={scenarioQuery}
              onChange={(event) => setScenarioQuery(event.target.value)}
              placeholder={t('step2.searchPlaceholder')}
              className="mt-2 w-full rounded border border-[#21262d] bg-[#0c0f1c] px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,240,255,0.16)]"
            />
          </label>
          <label className="mt-4 block">
            <span className="font-mono text-sm font-black text-cyan-300">{t('step2.scenarioPreset')}</span>
            <select
              value={filteredScenarios.length === 0 ? '' : activeScenarioId}
              onChange={(event) => {
                if (event.target.value) {
                  onScenarioChange(event.target.value)
                }
              }}
              className="mt-2 w-full rounded border border-[#21262d] bg-[#0c0f1c] px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,240,255,0.16)]"
            >
              {filteredScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.title} [{scenario.category}]
                </option>
              ))}
              {filteredScenarios.length === 0 && <option value="">{t('step2.noScenariosMatch')}</option>}
            </select>
          </label>
          <p className="mt-3 font-mono text-sm text-slate-400">
            {t('step2.presetsVisible', { visible: filteredScenarios.length, total: scenarios.length })}
          </p>
          {selectedScenario && (
            <p className="mt-3 font-mono text-sm text-slate-400">
              {t('step2.exceptionProfile', {
                exceptionType: selectedScenario.exceptionType,
                exceptionCode: selectedScenario.exceptionCode,
              })}
            </p>
          )}
        </div>
        <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
          <CaseStudyCard title={t('step2.eventA')} caseKey="eventA" caseStudy={caseStudies.eventA} onChange={onChange} />
          <CaseStudyCard title={t('step2.eventB')} caseKey="eventB" caseStudy={caseStudies.eventB} onChange={onChange} />
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 sm:mt-12 md:mt-16">
          <button
            type="button"
            onClick={onCompile}
            disabled={isCompiling}
            className="w-full rounded-md bg-cyan-400 px-8 py-4 font-mono text-sm font-black text-[#071018] shadow-[0_0_40px_rgba(0,240,255,0.48)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:animate-pulse disabled:cursor-wait sm:min-w-72 sm:w-auto sm:px-10 sm:py-5"
          >
            {isCompiling ? t('step2.compiling') : `${t('step2.compile')} ⚡`}
          </button>
          <p className="font-mono text-sm text-slate-400">{t('step2.shortcut')}</p>
        </div>
      </div>
    </div>
  )
}

function CaseStudyCard({
  title,
  caseKey,
  caseStudy,
  onChange,
}: {
  title: string
  caseKey: CaseStudyKey
  caseStudy: CaseStudy
  onChange: (caseKey: CaseStudyKey, field: keyof CaseStudy, value: string) => void
}) {
  const { t } = useTranslation()

  const fieldLabelMap: Record<keyof CaseStudy, string> = {
    subject: t('caseStudy.subject'),
    act: t('caseStudy.act'),
    context: t('caseStudy.context'),
  }

  return (
    <div className="rounded-lg border border-[#21262d] bg-[#111320] p-5 shadow-2xl shadow-black/30 sm:p-7">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-white">{title}</h2>
        <Lock size={16} className="text-slate-600" />
      </div>
      <label className="block">
        <span className="font-mono text-sm text-slate-400">{t('caseStudy.scenarioDescription')}</span>
        <div className="mt-2 rounded border border-[#21262d] bg-[#0a0c10] p-4 font-mono text-sm leading-6 text-slate-300">
          // {caseStudy.subject} {caseStudy.act.toLowerCase()}
        </div>
      </label>
      {(['subject', 'act', 'context'] as const).map((field) => (
        <label key={field} className="mt-5 block">
          <span className="font-mono text-sm font-black text-cyan-300">{fieldLabelMap[field]}</span>
          <textarea
            value={caseStudy[field]}
            onChange={(event) => onChange(caseKey, field, event.target.value)}
            rows={field === 'context' ? 4 : 3}
            className="mt-2 w-full resize-y rounded border border-[#21262d] bg-[#0c0f1c] px-4 py-3.5 font-mono text-sm leading-6 text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,240,255,0.16)] sm:text-base"
          />
        </label>
      ))}
    </div>
  )
}

function ResultStep({
  principle,
  caseStudies,
  scenario,
  lintResult,
}: {
  principle: Principle
  caseStudies: CaseStudies
  scenario: ScenarioPreset
  lintResult: LintRunResult | null
}) {
  const { t } = useTranslation()
  const hasFailed = lintResult?.status === 'FAILED'

  return (
    <div className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">{t('step3.title')}</h1>
        <p className="mt-3 font-mono text-sm text-slate-400">
          {hasFailed ? (
            <>
              <span className="font-black text-red-400">{t('step3.failedPrefix', { exception: lintResult.exception })}</span>
            </>
          ) : (
            <>
              <span className="font-black text-emerald-400">{t('step3.successPrefix')}</span>
            </>
          )}
        </p>
      </div>
      <div className="mt-6 grid gap-6 lg:mt-8 lg:gap-7 xl:grid-cols-[1fr_320px]">
        <TerminalPane caseStudies={caseStudies} scenario={scenario} lintResult={lintResult} />
        <ConfigSummary principle={principle} caseStudies={caseStudies} />
      </div>
      <GotchaSummary />
      <footer className="mt-6 flex flex-col gap-2 font-mono text-sm text-slate-400 sm:mt-8 sm:flex-row sm:justify-between">
        <span className="text-cyan-400">{t('step3.analysisComplete')}</span>
        <span>culture-lint v2026.3.2</span>
      </footer>
    </div>
  )
}

function TerminalPane({
  caseStudies,
  scenario,
  lintResult,
}: {
  caseStudies: CaseStudies
  scenario: ScenarioPreset
  lintResult: LintRunResult | null
}) {
  const { t } = useTranslation()
  const hasFailed = lintResult?.status === 'FAILED'
  const eventBStatusLabel = hasFailed ? '[FAIL]' : '[PASS]'
  const eventBSymbol = hasFailed ? '✘' : '✔'

  return (
    <section className="rounded border border-cyan-400/30 bg-black/70 shadow-[0_0_35px_rgba(0,240,255,0.14)]">
      <div className="border-b border-cyan-400/20 bg-cyan-400/5 px-4 py-3 font-mono text-xs font-black tracking-wide text-cyan-300 sm:px-5 sm:text-sm">{t('terminal.header')}</div>
      <div className="space-y-3 break-words p-4 font-mono text-xs leading-6 text-slate-200 sm:p-6 sm:text-sm sm:leading-7">
        <p className="text-emerald-400">$ culture-lint compile --run-analysis</p>
        <p><span className="text-cyan-400">[INFO]</span> {t('terminal.compileInfo')}</p>
        <p><span className="text-emerald-400">[PASS]</span> {t('terminal.eventALine', { subject: caseStudies.eventA.subject, act: caseStudies.eventA.act })}</p>
        <div className="pl-5 text-slate-300">
          <p>↳ {t('terminal.expectedReaction', { reaction: scenario.caseStudyA.expectedReaction, symbol: '✔' })}</p>
          <p>↳ {t('terminal.moralJustification', { text: scenario.caseStudyA.justificationLogic, symbol: '✔' })}</p>
          <p>↳ {t('terminal.verdict')} <span className="font-black text-emerald-400">{t('terminal.reactionRouted', { reaction: scenario.caseStudyA.expectedReaction.toUpperCase(), symbol: '✔' })}</span></p>
        </div>
        <p className="text-emerald-400">{t('terminal.eventAPassed')}</p>
        <div className="my-4 border-t border-dashed border-red-500/70" />
        <p><span className={hasFailed ? 'text-red-400' : 'text-emerald-400'}>{eventBStatusLabel}</span> {t('terminal.eventBLine', { subject: caseStudies.eventB.subject, act: caseStudies.eventB.act })}</p>
        <div className="pl-5 text-slate-300">
          <p>↳ {t('terminal.expectedReaction', { reaction: scenario.caseStudyB.expectedReaction, symbol: eventBSymbol })}</p>
          <p>↳ {t('terminal.moralJustification', { text: scenario.caseStudyB.justificationLogic, symbol: eventBSymbol })}</p>
          <p>
            ↳ {t('terminal.verdict')}{' '}
            <span className={hasFailed ? 'font-black text-red-400' : 'font-black text-emerald-400'}>
              {t('terminal.reactionRouted', { reaction: scenario.caseStudyB.expectedReaction.toUpperCase(), symbol: eventBSymbol })}
            </span>
          </p>
        </div>
        {hasFailed && (
          <>
            <div className="pt-3 text-red-400">
              <p className="text-lg font-black">{t('terminal.compilationFailed', { exception: lintResult.exception })}</p>
              <div className="my-3 h-px bg-red-500/70" />
              <p><span className="text-orange-300">{t('terminal.location')}</span> {t('terminal.locationValue')}</p>
              <p><span className="text-orange-300">{t('terminal.errorCode')}</span> {lintResult.code}</p>
            </div>
            <div>
              <p className="font-black text-yellow-300">{t('terminal.description')}</p>
              <p className="text-red-300">{lintResult.description}</p>
            </div>
          </>
        )}
        {!hasFailed && (
          <div className="pt-3 text-emerald-400">
            <p className="text-lg font-black">{t('terminal.compilationSucceeded')}</p>
          </div>
        )}
        <div>
          <p className="font-black text-yellow-300">{t('terminal.traceback')}</p>
          <p>↳ {t('terminal.trace1')}</p>
          <p>↳ {t('terminal.trace2')}</p>
          <p>↳ {t('terminal.trace3')} <span className="font-black text-red-400">{t('terminal.dynamicMutation')}</span></p>
        </div>
        <p>{t('terminal.codeSmell')}</p>
        <p className={hasFailed ? 'text-red-400' : 'text-emerald-400'}>{hasFailed ? t('terminal.buildStatusFailed') : t('terminal.buildStatusSuccess')}</p>
      </div>
    </section>
  )
}

function ConfigSummary({ principle, caseStudies }: { principle: Principle; caseStudies: CaseStudies }) {
  const { t } = useTranslation()

  return (
    <aside className="space-y-5">
      <div className="rounded-lg border border-cyan-400/70 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.12)]">
        <div className="flex items-center justify-between font-mono text-sm font-black text-cyan-300">
          {t('config.summary')}
          <FileCode2 size={13} className="text-slate-500" />
        </div>
        <p className="mt-6 font-mono text-sm text-slate-400">{t('config.activePrinciple')}</p>
        <p className="mt-1 text-base text-slate-200">{principle.label[0] + principle.label.slice(1).toLowerCase()}</p>
        <div className="mt-4 rounded bg-[#0a0c10] p-4 font-mono text-sm leading-6 text-slate-300">&quot;{principle.value}&quot;</div>
        <div className="mt-5 space-y-2 font-mono text-sm leading-6 text-slate-300">
          <p><span className="text-cyan-400">●</span> {caseStudies.eventA.subject} / {caseStudies.eventA.context}</p>
          <p><span className="text-cyan-400">●</span> {caseStudies.eventB.subject} / {caseStudies.eventB.context}</p>
        </div>
      </div>
      <div className="rounded border border-[#21262d] bg-[#111320]/70 p-5 font-mono text-sm leading-6 text-slate-300">
        <p className="text-cyan-400">{t('config.integrityNote')}</p>
        <p className="mt-4"><Lock size={12} className="mr-2 inline" />{t('config.lockNote')}</p>
      </div>
    </aside>
  )
}

function GotchaSummary() {
  const { t } = useTranslation()

  return (
    <section className="mt-8 rounded-lg border border-cyan-400 bg-[#111320] p-5 shadow-[0_0_38px_rgba(0,240,255,0.18)] sm:p-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-3 font-mono text-sm font-black text-cyan-400"><Zap size={16} className="text-yellow-300" /> {t('gotcha.title')}</h2>
        <span className="rounded border border-red-400/70 px-2 py-1 font-mono text-xs text-red-400">{t('gotcha.severity')}</span>
      </div>
      <p className="font-bold text-white">{t('gotcha.confirmed')}</p>
      <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">
        {t('gotcha.description')}
      </p>
    </section>
  )
}

export default App
