import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Check,
  ChevronDown,
  Copy,
  FileCode2,
  GripVertical,
  Home,
  Link2,
  RefreshCw,
  Settings,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getScenarioDatabase } from './data/scenarios'
import { buildSessionQueue, runCultureLintSession } from './engine/linterEngine'
import { generateSeed, normalizeSeed } from './engine/random'
import { type Principle, type ScenarioPreset, type ScenarioRunOutcome, type SessionRun } from './types/linter'

type Step = 1 | 2 | 3

const DEFAULT_PRINCIPLE_ORDER = ['transparency', 'accountability', 'equality'] as const
const SEED_QUERY_PARAM = 'seed'

const formatPrincipleLabel = (label: string) => label.charAt(0) + label.slice(1).toLowerCase()

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
  const [isRunning, setIsRunning] = useState(false)
  const [session, setSession] = useState<SessionRun | null>(null)
  const runTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    writeSeedToUrl(seed)
  }, [seed])

  useEffect(() => {
    return () => {
      if (runTimeoutRef.current !== undefined) {
        window.clearTimeout(runTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [step])

  const rankedPrinciples = useMemo(
    () =>
      principleRanking
        .map((id) => principleById.get(id))
        .filter((principle): principle is Principle => Boolean(principle)),
    [principleById, principleRanking],
  )

  const sessionQueue = useMemo(
    () => buildSessionQueue({ seed, scenarios: scenarioDatabase }),
    [scenarioDatabase, seed],
  )

  const progressItems = useMemo(
    () => [
      { label: t('progress.rankPrinciples'), active: step === 1, complete: step > 1 },
      { label: t('progress.runGauntlet'), active: step === 2, complete: step > 2 },
      { label: t('progress.sessionResults'), active: step === 3, complete: false },
    ],
    [step, t],
  )

  const runSession = (nextSeed: string) => {
    if (runTimeoutRef.current !== undefined) {
      window.clearTimeout(runTimeoutRef.current)
    }

    setSeed(nextSeed)
    setIsRunning(true)

    runTimeoutRef.current = window.setTimeout(() => {
      const queue = buildSessionQueue({ seed: nextSeed, scenarios: scenarioDatabase })
      const result = runCultureLintSession({
        seed: nextSeed,
        principleRanking,
        queue,
        resolvePrinciple: (principleId) => principleById.get(principleId) ?? principles[0],
        options: {
          formatReactionMutationDescription: ({ fromReaction, toReaction }) =>
            t('errors.reactionMutation', { fromReaction, toReaction }),
        },
      })

      setSession(result)
      setIsRunning(false)
      setStep(3)
      runTimeoutRef.current = undefined
    }, 1500)
  }

  const handleReorder = (nextOrder: string[]) => {
    setPrincipleRanking(nextOrder)
    setSession(null)
  }

  const handleSeedChange = (value: string) => {
    setSeed(normalizeSeed(value))
    setSession(null)
  }

  const handleNewSeed = () => {
    setSeed(generateSeed())
    setSession(null)
  }

  const resetToInitialState = () => {
    if (runTimeoutRef.current !== undefined) {
      window.clearTimeout(runTimeoutRef.current)
      runTimeoutRef.current = undefined
    }

    setStep(1)
    setPrincipleRanking([...DEFAULT_PRINCIPLE_ORDER])
    setIsRunning(false)
    setSession(null)
  }

  return (
    <main className="safe-screen min-h-dvh overflow-x-clip bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px] opacity-70 sm:opacity-100" />
      <div className="relative flex min-h-dvh flex-col md:flex-row">
        <Sidebar onHomeClick={resetToInitialState} />
        <section className="flex min-h-dvh flex-1 flex-col border-t border-[#21262d] bg-[#0d1117]/95 pb-[calc(7.5rem+env(safe-area-inset-bottom))] sm:pb-24 md:border-l md:border-t-0 md:pb-0">
          <TopBar progressItems={progressItems} step={step} hasFailures={Boolean(session && session.failedCount > 0)} />
          {step === 1 && (
            <RankingStep principles={rankedPrinciples} onReorder={handleReorder} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <SessionSetupStep
              seed={seed}
              queue={sessionQueue}
              isRunning={isRunning}
              onSeedChange={handleSeedChange}
              onNewSeed={handleNewSeed}
              onRun={() => runSession(seed)}
            />
          )}
          {step === 3 && session && (
            <SessionResultStep
              session={session}
              principles={principles}
              onRerunSameSeed={() => runSession(session.seed)}
              onNewSeedRun={() => runSession(generateSeed())}
            />
          )}
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

function TopBar({
  progressItems,
  step,
  hasFailures,
}: {
  progressItems: { label: string; active: boolean; complete: boolean }[]
  step: Step
  hasFailures: boolean
}) {
  const { t, i18n } = useTranslation()

  return (
    <header className="compact-header flex min-h-16 flex-wrap items-center justify-between gap-y-3 border-b border-[#21262d] bg-[#0b0d17] px-4 py-3 text-sm text-slate-400 sm:px-5 md:h-16 md:flex-nowrap md:py-0 lg:px-9">
      <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
        <span className="rounded-sm bg-cyan-400 px-1.5 py-1 text-xs text-[#071018]">C</span>
        <span className="text-xs sm:text-sm">{t('appName')}</span>
      </div>
      <div className="rounded border border-[#30363d] px-3 py-1.5 font-mono text-xs text-slate-300 md:hidden">
        {`Step ${step} / 3`}
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
        {step === 3 && hasFailures && (
          <span className="rounded border border-red-500/70 px-2 py-1 text-xs text-red-400 sm:px-3">{t('topbar.compileFailed')}</span>
        )}
        <span className="hidden lg:inline">{t('topbar.analyst')}</span>
        <span className="hidden h-7 w-7 rounded-full bg-indigo-500/25 lg:block" />
      </div>
    </header>
  )
}

function RankingStep({
  principles,
  onReorder,
  onNext,
}: {
  principles: Principle[]
  onReorder: (nextOrder: string[]) => void
  onNext: () => void
}) {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const orderIds = principles.map((principle) => principle.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = orderIds.indexOf(String(active.id))
    const newIndex = orderIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onReorder(arrayMove(orderIds, oldIndex, newIndex))
  }

  const move = (id: string, direction: -1 | 1) => {
    const index = orderIds.indexOf(id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= orderIds.length) {
      return
    }

    onReorder(arrayMove(orderIds, index, target))
  }

  return (
    <div className="flex flex-1 items-start px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-4xl">
        <div className="mb-8 font-mono text-xs text-slate-500 sm:mb-10">
          {t('rank.progress')}
          <div className="mt-3 flex gap-2">
            <span className="h-0.5 w-10 bg-cyan-400" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">{t('rank.title')}</h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">{t('rank.description')}</p>
        <p className="mt-3 font-mono text-xs text-cyan-300">{t('rank.hint')}</p>

        <div className="mt-8 flex items-center justify-between font-mono text-xs text-slate-500 sm:mt-10">
          <span className="text-emerald-400">↑ {t('rank.mostImportant')}</span>
          <span className="text-red-400">↓ {t('rank.leastImportant')}</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
            <ul className="mt-3 space-y-4">
              {principles.map((principle, index) => (
                <SortablePrincipleRow
                  key={principle.id}
                  principle={principle}
                  rank={index + 1}
                  isFirst={index === 0}
                  isLast={index === principles.length - 1}
                  onMoveUp={() => move(principle.id, -1)}
                  onMoveDown={() => move(principle.id, 1)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="mt-10 flex justify-end sm:mt-12">
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-md bg-cyan-400 px-8 py-4 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
          >
            {t('rank.next')}
          </button>
        </div>
      </div>
    </div>
  )
}

function SortablePrincipleRow({
  principle,
  rank,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: {
  principle: Principle
  rank: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: principle.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch gap-3 rounded-xl border bg-[#161b22] p-4 transition sm:p-5 ${isDragging ? 'border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.25)]' : 'border-[#21262d]'}`}
    >
      <button
        type="button"
        aria-label={t('rank.dragHandle')}
        className="flex shrink-0 cursor-grab touch-none items-center rounded-md px-1 text-slate-500 transition hover:text-cyan-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <div className="flex shrink-0 flex-col items-center justify-center">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-400/60 font-mono text-sm font-black text-cyan-300">
          {rank}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-sm font-black text-cyan-300">{formatPrincipleLabel(principle.label)}</span>
          <span className="font-mono text-xs text-slate-500">{t('rank.rankLabel', { rank })}</span>
        </div>
        <p className="mt-2 text-sm italic leading-6 text-slate-200">&quot;{principle.value}&quot;</p>
      </div>
      <div className="flex shrink-0 flex-col justify-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={t('rank.moveUp')}
          className="grid h-8 w-8 place-items-center rounded-md border border-[#30363d] text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown size={15} className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={t('rank.moveDown')}
          className="grid h-8 w-8 place-items-center rounded-md border border-[#30363d] text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </li>
  )
}

function SessionSetupStep({
  seed,
  queue,
  isRunning,
  onSeedChange,
  onNewSeed,
  onRun,
}: {
  seed: string
  queue: ScenarioPreset[]
  isRunning: boolean
  onSeedChange: (value: string) => void
  onNewSeed: () => void
  onRun: () => void
}) {
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
      <div className="w-full max-w-4xl">
        <p className="font-mono text-sm text-slate-400">{t('session.armed')}</p>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">{t('session.title')}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">{t('session.description')}</p>

        <div className="mt-8 rounded-lg border border-cyan-400/40 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.10)] sm:p-6">
          <div className="flex items-center gap-2 font-mono text-sm font-black text-cyan-300">
            <Zap size={15} className="text-yellow-300" /> {t('session.briefingTitle')}
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{t('session.briefingBody')}</p>
        </div>

        <div className="mt-6 rounded-lg border border-[#21262d] bg-[#111320] p-5 sm:p-6">
          <label className="block">
            <span className="font-mono text-sm font-black text-cyan-300">{t('session.seedLabel')}</span>
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

        <div className="mt-6 rounded-lg border border-[#21262d] bg-[#111320] p-5 sm:p-6">
          <div className="flex items-center justify-between font-mono text-sm font-black text-cyan-300">
            <span className="flex items-center gap-2">
              <Link2 size={14} /> {t('session.queueTitle')}
            </span>
            <span className="text-slate-500">{t('session.queueCount', { count: queue.length })}</span>
          </div>
          <ol className="mt-4 space-y-2 font-mono text-sm text-slate-300">
            {queue.map((scenario, index) => (
              <li key={scenario.id} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-cyan-400">{String(index + 1).padStart(2, '0')}</span>
                <span className="min-w-0">
                  {scenario.title} <span className="text-slate-500">[{scenario.category}]</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:mt-12 sm:pb-2 md:mt-14 md:pb-0">
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="relative z-10 w-full max-w-full rounded-md bg-cyan-400 px-5 py-4 text-center font-mono text-xs font-black leading-5 text-[#071018] [overflow-wrap:anywhere] shadow-[0_0_40px_rgba(0,240,255,0.48)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:animate-pulse disabled:cursor-wait sm:min-w-72 sm:w-auto sm:px-10 sm:py-5 sm:text-sm"
          >
            <span className="sm:hidden">{isRunning ? t('session.running') : t('session.run')}</span>
            <span className="hidden sm:inline">{isRunning ? t('session.running') : `${t('session.run')} ⚡`}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function SessionResultStep({
  session,
  principles,
  onRerunSameSeed,
  onNewSeedRun,
}: {
  session: SessionRun
  principles: Principle[]
  onRerunSameSeed: () => void
  onNewSeedRun: () => void
}) {
  const { t } = useTranslation()
  const hasFailures = session.failedCount > 0

  const rankIndexById = useMemo(() => {
    const lookup = new Map<string, number>()
    session.principleRanking.forEach((id, index) => lookup.set(id, index))
    return lookup
  }, [session.principleRanking])

  const orderedOutcomes = useMemo(
    () =>
      session.outcomes
        .map((outcome, index) => ({ outcome, index }))
        .sort((a, b) => {
          const rankA = rankIndexById.get(a.outcome.scenario.principleId) ?? Number.MAX_SAFE_INTEGER
          const rankB = rankIndexById.get(b.outcome.scenario.principleId) ?? Number.MAX_SAFE_INTEGER
          if (rankA !== rankB) {
            return rankA - rankB
          }
          return a.index - b.index
        })
        .map(({ outcome }) => outcome),
    [rankIndexById, session.outcomes],
  )

  const principleStatuses = useMemo(
    () =>
      session.principleRanking.map((id) => {
        const principle = principles.find((candidate) => candidate.id === id)
        const relevant = session.outcomes.filter((outcome) => outcome.scenario.principleId === id)
        const failed = relevant.some((outcome) => outcome.result.status === 'FAILED')
        return {
          id,
          label: principle ? formatPrincipleLabel(principle.label) : id,
          tested: relevant.length > 0,
          failed,
        }
      }),
    [principles, session.outcomes, session.principleRanking],
  )

  return (
    <div className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">{t('sessionResult.title')}</h1>
        <p className="mt-3 font-mono text-sm">
          {hasFailures ? (
            <span className="font-black text-red-400">
              {t('sessionResult.summaryFailed', { failed: session.failedCount, total: session.outcomes.length })}
            </span>
          ) : (
            <span className="font-black text-emerald-400">
              {t('sessionResult.summaryClean', { total: session.outcomes.length })}
            </span>
          )}
        </p>
        <p className="mt-2 font-mono text-xs text-slate-500">{t('sessionResult.seedUsed', { seed: session.seed })}</p>
      </div>

      <section className="mt-6 rounded-lg border border-cyan-400/60 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.12)] sm:p-6">
        <div className="flex items-center gap-2 font-mono text-sm font-black text-cyan-300">
          <ShieldCheck size={15} /> {t('sessionResult.rankingRecap')}
        </div>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          {principleStatuses.map((entry, index) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 border-b border-[#21262d] pb-2 last:border-0 last:pb-0">
              <span className="flex items-center gap-3 text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-cyan-400/50 text-xs text-cyan-300">{index + 1}</span>
                {entry.label}
              </span>
              {!entry.tested ? (
                <span className="text-slate-500">{t('sessionResult.notTested')}</span>
              ) : entry.failed ? (
                <span className="font-black text-red-400">{t('sessionResult.contradictionFound')}</span>
              ) : (
                <span className="font-black text-emerald-400">{t('sessionResult.consistent')}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <h2 className="mt-8 font-mono text-sm font-black text-cyan-300">{t('sessionResult.scenarioBreakdown')}</h2>
      <div className="mt-4 space-y-4">
        {orderedOutcomes.map((outcome, index) => (
          <ScenarioOutcomeCard
            key={outcome.scenario.id}
            outcome={outcome}
            defaultExpanded={outcome.result.status === 'FAILED' && index === 0}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRerunSameSeed}
          className="flex items-center justify-center gap-2 rounded-md border border-[#30363d] px-5 py-3 font-mono text-xs font-black text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200"
        >
          <RefreshCw size={14} /> {t('sessionResult.rerunSameSeed')}
        </button>
        <button
          type="button"
          onClick={onNewSeedRun}
          className="flex items-center justify-center gap-2 rounded-md bg-cyan-400 px-5 py-3 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300"
        >
          <Zap size={14} /> {t('sessionResult.newSeedRun')}
        </button>
      </div>

      <footer className="mt-8 flex flex-col gap-2 font-mono text-sm text-slate-400 sm:flex-row sm:justify-between">
        <span className="text-cyan-400">{t('step3.analysisComplete')}</span>
        <span>culture-lint v2026.3.2</span>
      </footer>
    </div>
  )
}

function ScenarioOutcomeCard({ outcome, defaultExpanded }: { outcome: ScenarioRunOutcome; defaultExpanded: boolean }) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { scenario, result } = outcome
  const hasFailed = result.status === 'FAILED'

  return (
    <section
      className={`overflow-hidden rounded-lg border bg-[#111320] ${hasFailed ? 'border-red-500/50' : 'border-emerald-500/40'}`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span className="min-w-0">
          <span className="block truncate font-bold text-white">{scenario.title}</span>
          <span className="mt-1 block font-mono text-xs text-slate-500">[{scenario.category}]</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span
            className={`rounded border px-2 py-1 font-mono text-xs font-black ${hasFailed ? 'border-red-400/70 text-red-400' : 'border-emerald-400/70 text-emerald-400'}`}
          >
            {hasFailed ? t('sessionResult.doubleStandard') : t('sessionResult.consistentBadge')}
          </span>
          <ChevronDown size={16} className={`text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[#21262d] bg-black/60 p-4 font-mono text-xs leading-6 text-slate-200 sm:p-5 sm:text-sm sm:leading-7">
          <p className="text-emerald-400">$ culture-lint compile --scenario {scenario.id}</p>
          <p className="mt-2">
            <span className="text-emerald-400">[PASS]</span>{' '}
            {t('terminal.eventALine', { subject: scenario.caseStudyA.subject, act: scenario.caseStudyA.act })}
          </p>
          <p className="pl-4 text-slate-300">
            ↳ {t('terminal.expectedReaction', { reaction: scenario.caseStudyA.expectedReaction, symbol: '✔' })}
          </p>
          <div className="my-3 border-t border-dashed border-slate-700" />
          <p>
            <span className={hasFailed ? 'text-red-400' : 'text-emerald-400'}>{hasFailed ? '[FAIL]' : '[PASS]'}</span>{' '}
            {t('terminal.eventBLine', { subject: scenario.caseStudyB.subject, act: scenario.caseStudyB.act })}
          </p>
          <p className="pl-4 text-slate-300">
            ↳ {t('terminal.expectedReaction', { reaction: scenario.caseStudyB.expectedReaction, symbol: hasFailed ? '✘' : '✔' })}
          </p>
          {result.status === 'FAILED' ? (
            <div className="mt-3 text-red-300">
              <p className="font-black text-red-400">{t('terminal.compilationFailed', { exception: result.exception })}</p>
              <p className="mt-1">
                <span className="text-orange-300">{t('terminal.errorCode')}</span> {result.code}
              </p>
              <p className="mt-1">{result.description}</p>
            </div>
          ) : (
            <p className="mt-3 font-black text-emerald-400">{t('terminal.compilationSucceeded')}</p>
          )}
        </div>
      )}
    </section>
  )
}

export default App
