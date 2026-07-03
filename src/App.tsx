import { Check, FileCode2, Home, Lock, Settings, ShieldCheck, Terminal, Zap } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

type Step = 1 | 2 | 3

type CaseStudyKey = 'eventA' | 'eventB'

type CaseStudy = {
  subject: string
  act: string
  context: string
}

type CaseStudies = Record<CaseStudyKey, CaseStudy>

type Principle = {
  id: string
  label: string
  status: string
  metadata: string[]
  value: string
  code: string
}

const principles: Principle[] = [
  {
    id: 'transparency',
    label: 'TRANSPARENCY',
    status: '[INACTIVE] RULE: TRANSPARENCY',
    metadata: ['// Interface: DataAccess.public()', '// State: IMMUTABLE CONSTANT'],
    value: 'All financial data MUST be publicly accessible.',
    code: 'CHK_012',
  },
  {
    id: 'accountability',
    label: 'ACCOUNTABILITY',
    status: '[ACTIVE] RULE: ACCOUNTABILITY',
    metadata: ['// Interface: LeaderResignation.if(CaughtLying)', '// State: IMMUTABLE CONSTANT.'],
    value: 'A leader MUST resign if caught lying.',
    code: 'CHK_034',
  },
  {
    id: 'equality',
    label: 'EQUALITY',
    status: '[INACTIVE] RULE: EQUALITY',
    metadata: ['// Interface: PayGap.max(2x)', '// State: IMMUTABLE CONSTANT'],
    value: 'No employee shall earn more than 2x the median salary.',
    code: 'CHK_088',
  },
]

const defaultCases: CaseStudies = {
  eventA: {
    subject: 'Politician X',
    act: 'Lied about budget',
    context: 'Budget Hearing',
  },
  eventB: {
    subject: 'Your Preferred Leader',
    act: 'Lied about meeting',
    context: 'Campaign Rally',
  },
}

function App() {
  const [step, setStep] = useState<Step>(1)
  const [selectedPrinciple, setSelectedPrinciple] = useState<Principle | null>(null)
  const [caseStudies, setCaseStudies] = useState<CaseStudies>(defaultCases)
  const [isCompiling, setIsCompiling] = useState(false)
  const compileTimeoutRef = useRef<number | undefined>(undefined)

  const lockedPrinciple = selectedPrinciple ?? principles[1]

  const progressItems = useMemo(
    () => [
      { label: 'Bias Detection', active: step === 1, complete: step > 1 },
      { label: 'Metadata Assignment', active: step === 2, complete: step > 2 },
      { label: 'Result Analysis', active: step === 3, complete: false },
    ],
    [step],
  )

  const updateCaseStudy = (caseKey: CaseStudyKey, field: keyof CaseStudy, value: string) => {
    setCaseStudies((current) => ({
      ...current,
      [caseKey]: {
        ...current[caseKey],
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    return () => {
      if (compileTimeoutRef.current !== undefined) {
        window.clearTimeout(compileTimeoutRef.current)
      }
    }
  }, [])

  const compileCaseStudy = () => {
    if (compileTimeoutRef.current !== undefined) {
      window.clearTimeout(compileTimeoutRef.current)
    }

    setIsCompiling(true)
    compileTimeoutRef.current = window.setTimeout(() => {
      compileTimeoutRef.current = undefined
      setIsCompiling(false)
      setStep(3)
    }, 1500)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0a0c10] text-slate-100 selection:bg-cyan-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,240,255,0.08),transparent_34%),linear-gradient(90deg,rgba(88,166,255,0.04)_1px,transparent_1px),linear-gradient(rgba(88,166,255,0.04)_1px,transparent_1px)] bg-[size:auto,44px_44px,44px_44px]" />
      <div className="relative flex min-h-screen">
        <Sidebar />
        <section className="flex min-h-screen flex-1 flex-col border-l border-[#21262d] bg-[#0d1117]/95">
          <TopBar progressItems={progressItems} step={step} />
          {step === 1 && (
            <PrincipleStep
              principles={principles}
              selectedPrinciple={selectedPrinciple}
              onSelect={setSelectedPrinciple}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <MetadataStep
              caseStudies={caseStudies}
              isCompiling={isCompiling}
              onChange={updateCaseStudy}
              onCompile={compileCaseStudy}
            />
          )}
          {step === 3 && <ResultStep principle={lockedPrinciple} caseStudies={caseStudies} />}
        </section>
      </div>
    </main>
  )
}

function Sidebar() {
  return (
    <aside className="hidden w-14 flex-col items-center border-r border-[#21262d] bg-[#07090d] py-6 text-slate-500 md:flex">
      <div className="mb-9 rounded-md border border-cyan-400/60 p-1 text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.28)]">
        <ShieldCheck size={16} />
      </div>
      <div className="flex flex-1 flex-col gap-5">
        <Home className="text-cyan-300" size={17} />
        <FileCode2 size={17} />
        <Terminal size={17} />
        <Settings size={17} />
      </div>
      <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(255,123,114,0.9)]" />
    </aside>
  )
}

function TopBar({ progressItems, step }: { progressItems: { label: string; active: boolean; complete: boolean }[]; step: Step }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#21262d] bg-[#0b0d17] px-5 text-xs text-slate-500 lg:px-9">
      <div className="flex items-center gap-2 font-mono font-bold text-slate-100">
        <span className="rounded-sm bg-cyan-400 px-1.5 py-1 text-[10px] text-[#071018]">C</span>
        Culture-Lint
      </div>
      <nav className="hidden items-center gap-6 md:flex">
        {progressItems.map((item, index) => (
          <div key={item.label} className={`flex items-center gap-2 ${item.active ? 'text-cyan-300' : item.complete ? 'text-emerald-400' : ''}`}>
            <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] ${item.active ? 'border-cyan-300 bg-cyan-300 text-[#071018]' : item.complete ? 'border-emerald-400' : 'border-slate-700'}`}>
              {item.complete ? <Check size={12} /> : index + 1}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-4 font-mono">
        {step === 3 && <span className="rounded border border-red-500/70 px-3 py-1 text-red-400">COMPILE FAILED</span>}
        <span>analyst_04</span>
        <span className="h-7 w-7 rounded-full bg-indigo-500/25" />
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
  return (
    <div className="flex flex-1 items-center px-6 py-10 lg:px-20">
      <div className="w-full max-w-6xl">
        <div className="mb-10 font-mono text-[11px] text-slate-500">
          STEP 1 OF 3
          <div className="mt-3 flex gap-2">
            <span className="h-0.5 w-10 bg-cyan-400" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
          </div>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">Step 1: Declare Your Baseline Immutable Principle</h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">
          Select one foundational rule that your organization must never violate. This principle serves as the invariant for all future culture-linting checks.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {principles.map((principle) => {
            const active = selectedPrinciple?.id === principle.id
            return (
              <button
                key={principle.id}
                type="button"
                onClick={() => onSelect(principle)}
                className={`group min-h-72 rounded-xl border bg-[#161b22] p-6 text-left transition duration-300 ${active ? 'border-emerald-400 shadow-[0_0_35px_rgba(86,211,100,0.18)]' : 'border-[#21262d] hover:border-cyan-400/50'}`}
              >
                <div className="flex items-start justify-between font-mono text-[10px]">
                  <span className={active ? 'text-emerald-400' : 'text-slate-600'}>{active ? '[SELECTED]' : principle.status}</span>
                  <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-emerald-400 bg-emerald-400 text-[#071018]' : 'border-[#30363d]'}`}>
                    {active && <Check size={13} />}
                  </span>
                </div>
                <div className="mt-16 space-y-1 font-mono text-[11px] text-cyan-400">
                  {principle.metadata.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
                <p className="mt-10 text-lg font-black italic leading-7 text-white">&quot;{principle.value}&quot;</p>
                <div className="mt-12 h-px bg-[#21262d]" />
                <p className="mt-2 text-right font-mono text-[9px] text-slate-600">{principle.code}</p>
              </button>
            )
          })}
        </div>
        <div className="mt-12 flex justify-end">
          <button
            type="button"
            disabled={!selectedPrinciple}
            onClick={onNext}
            className="rounded-md bg-cyan-400 px-8 py-4 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            NEXT &gt;
          </button>
        </div>
      </div>
    </div>
  )
}

function MetadataStep({
  caseStudies,
  isCompiling,
  onChange,
  onCompile,
}: {
  caseStudies: CaseStudies
  isCompiling: boolean
  onChange: (caseKey: CaseStudyKey, field: keyof CaseStudy, value: string) => void
  onCompile: () => void
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10 lg:px-20">
      <div className="w-full max-w-6xl">
        <p className="font-mono text-[11px] text-slate-600">// Cross-partisan analyzer armed</p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">Step 2: Assign Case Study Metadata</h1>
        <p className="mt-4 text-sm text-slate-400">Identify specific actors and actions to enable cross-sectional semantic analysis.</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <CaseStudyCard title="Event A (Rival):" caseKey="eventA" caseStudy={caseStudies.eventA} onChange={onChange} />
          <CaseStudyCard title="Event B (Ally):" caseKey="eventB" caseStudy={caseStudies.eventB} onChange={onChange} />
        </div>
        <div className="mt-16 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={onCompile}
            disabled={isCompiling}
            className="min-w-72 rounded-md bg-cyan-400 px-10 py-5 font-mono text-xs font-black text-[#071018] shadow-[0_0_40px_rgba(0,240,255,0.48)] transition hover:-translate-y-0.5 hover:bg-cyan-300 disabled:animate-pulse disabled:cursor-wait"
          >
            {isCompiling ? 'COMPILING SEMANTIC TREE...' : 'COMPILE CASE STUDY ⚡'}
          </button>
          <p className="font-mono text-[10px] text-slate-600">[ CMD + ENTER ] to proceed</p>
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
  return (
    <div className="rounded-lg border border-[#21262d] bg-[#111320] p-7 shadow-2xl shadow-black/30">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-bold text-white">{title}</h2>
        <Lock size={14} className="text-slate-600" />
      </div>
      <label className="block">
        <span className="font-mono text-[10px] text-slate-500">SCENARIO DESCRIPTION</span>
        <div className="mt-2 rounded border border-[#21262d] bg-[#0a0c10] p-4 font-mono text-xs text-slate-400">
          // {caseStudy.subject} {caseStudy.act.toLowerCase()}
        </div>
      </label>
      {(['subject', 'act', 'context'] as const).map((field) => (
        <label key={field} className="mt-5 block">
          <span className="font-mono text-[10px] font-black text-cyan-400">[{field.toUpperCase()}]</span>
          <input
            value={caseStudy[field]}
            onChange={(event) => onChange(caseKey, field, event.target.value)}
            className="mt-2 w-full rounded border border-[#21262d] bg-[#0c0f1c] px-4 py-3 font-mono text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_18px_rgba(0,240,255,0.16)]"
          />
        </label>
      ))}
    </div>
  )
}

function ResultStep({ principle, caseStudies }: { principle: Principle; caseStudies: CaseStudies }) {
  return (
    <div className="flex flex-1 flex-col px-6 py-8 lg:px-12">
      <div>
        <h1 className="text-3xl font-black text-white md:text-4xl">Step 3: Compilation Results</h1>
        <p className="mt-3 font-mono text-sm text-slate-400">
          <span className="font-black text-red-400">ShiftingLogicException</span> detected. Your stated principle failed structural integrity analysis.
        </p>
      </div>
      <div className="mt-8 grid flex-1 gap-7 xl:grid-cols-[1fr_340px]">
        <TerminalPane principle={principle} caseStudies={caseStudies} />
        <ConfigSummary principle={principle} caseStudies={caseStudies} />
      </div>
      <GotchaSummary />
      <footer className="mt-8 flex justify-between font-mono text-[10px] text-slate-600">
        <span className="text-cyan-400">■ ANALYSIS COMPLETE</span>
        <span>culture-lint v2026.3.2</span>
      </footer>
    </div>
  )
}

function TerminalPane({ principle, caseStudies }: { principle: Principle; caseStudies: CaseStudies }) {
  return (
    <section className="rounded border border-cyan-400/30 bg-black/70 shadow-[0_0_35px_rgba(0,240,255,0.14)]">
      <div className="border-b border-cyan-400/20 bg-cyan-400/5 px-5 py-3 font-mono text-[10px] font-black text-cyan-400">COMPILER TERMINAL OUTPUT</div>
      <div className="space-y-3 p-6 font-mono text-[12px] leading-6 text-slate-300">
        <p className="text-emerald-400">$ culture-lint compile --run-analysis</p>
        <p><span className="text-cyan-400">[INFO]</span> Compiling case study...</p>
        <p><span className="text-emerald-400">[PASS]</span> Event A: {caseStudies.eventA.subject} — {caseStudies.eventA.act}</p>
        <div className="pl-5 text-slate-400">
          <p>↳ Expected Reaction: Absolute Outrage ✔</p>
          <p>↳ Moral Justification: &quot;This proves their inherent malice.&quot; ✔</p>
          <p>↳ Verdict: <span className="font-black text-emerald-400">FULL ACCOUNTABILITY DEMANDED ✔</span></p>
        </div>
        <p className="text-emerald-400">Build status for Event A: PASSED</p>
        <div className="my-4 border-t border-dashed border-red-500/70" />
        <p><span className="text-red-400">[FAIL]</span> Event B: {caseStudies.eventB.subject} — {caseStudies.eventB.act}</p>
        <div className="pl-5 text-slate-400">
          <p>↳ Expected Reaction: Nuanced Defense ✘</p>
          <p>↳ Moral Justification: &quot;They were taken out of context.&quot; ✘</p>
          <p>↳ Verdict: <span className="font-black text-red-400">STRATEGIC SILENCE ✘</span></p>
        </div>
        <div className="pt-3 text-red-400">
          <p className="text-lg font-black">[ERROR] Compilation Failed: ShiftingLogicException</p>
          <div className="my-3 h-px bg-red-500/70" />
          <p><span className="text-orange-300">Location:</span> Line 13, Column 9 (Examples Table)</p>
          <p><span className="text-orange-300">Error Code:</span> CL_ERR_403_CONVENIENCE</p>
        </div>
        <div>
          <p className="font-black text-yellow-300">Description:</p>
          <p className="text-red-300">The property &quot;{principle.label}_STANDARD&quot; mutated dynamically from &quot;Absolute Outrage&quot; to &quot;Nuanced Defense&quot; without any state changes in the underlying &quot;Public_Figure&quot; object.</p>
        </div>
        <div>
          <p className="font-black text-yellow-300">Traceback:</p>
          <p>↳ Given a public figure makes an &quot;objectively offensive&quot; statement...</p>
          <p>↳ When the public reviews the statement...</p>
          <p>↳ Then the collective reaction should be <span className="font-black text-red-400">[DYNAMIC_MUTATION]</span></p>
        </div>
        <p><span className="font-black text-yellow-300">Code Smell Detected:</span> Identity-Based Routing</p>
        <p className="text-red-400">Build Status: FAILED (1 error, 0 warnings. Execution time: 42ms)</p>
      </div>
    </section>
  )
}

function ConfigSummary({ principle, caseStudies }: { principle: Principle; caseStudies: CaseStudies }) {
  return (
    <aside className="space-y-5">
      <div className="rounded-lg border border-cyan-400/70 bg-[#111320] p-5 shadow-[0_0_25px_rgba(0,240,255,0.12)]">
        <div className="flex items-center justify-between font-mono text-[10px] font-black text-cyan-400">
          CONFIG SUMMARY
          <FileCode2 size={13} className="text-slate-500" />
        </div>
        <p className="mt-6 font-mono text-[10px] text-slate-500">ACTIVE PRINCIPLE</p>
        <p className="mt-1 text-sm text-slate-300">{principle.label[0] + principle.label.slice(1).toLowerCase()}</p>
        <div className="mt-4 rounded bg-[#0a0c10] p-4 font-mono text-xs text-slate-400">&quot;{principle.value}&quot;</div>
        <div className="mt-5 space-y-2 font-mono text-xs text-slate-400">
          <p><span className="text-cyan-400">●</span> {caseStudies.eventA.subject} / {caseStudies.eventA.context}</p>
          <p><span className="text-cyan-400">●</span> {caseStudies.eventB.subject} / {caseStudies.eventB.context}</p>
        </div>
      </div>
      <div className="rounded border border-[#21262d] bg-[#111320]/70 p-5 font-mono text-xs text-slate-500">
        <p className="text-cyan-400">⊙ Structural integrity check looks for immutable response patterns.</p>
        <p className="mt-4"><Lock size={12} className="mr-2 inline" />State is locked in read-only memory.</p>
      </div>
    </aside>
  )
}

function GotchaSummary() {
  return (
    <section className="mt-8 rounded-lg border border-cyan-400 bg-[#111320] p-7 shadow-[0_0_38px_rgba(0,240,255,0.18)]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-3 font-mono text-sm font-black text-cyan-400"><Zap size={16} className="text-yellow-300" /> GOTCHA SUMMARY</h2>
        <span className="rounded border border-red-400/70 px-2 py-1 font-mono text-[10px] text-red-400">SEVERITY: CRITICAL</span>
      </div>
      <p className="font-bold text-white">Double Standard Confirmed.</p>
      <p className="mt-3 max-w-5xl text-sm leading-6 text-slate-300">
        You applied fundamentally different moral frameworks to symmetrical empirical acts. The only variable that changed was the Subject&apos;s Identity property. Code execution terminated.
      </p>
    </section>
  )
}

export default App
