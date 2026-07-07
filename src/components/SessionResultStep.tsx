import { ChevronDown, RefreshCw, ShieldCheck, Zap } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  type InteractiveSessionRun,
  type JudgmentVerdict,
  type Principle,
  type ScenarioJudgment,
} from '../types/linter'
import { formatPrincipleLabel } from '../utils/text'

type DiffSegment = {
  text: string
  isDifferent: boolean
}

const tokenizeForDiff = (value: string): string[] =>
  value.split(/(\s+)/).filter((token) => token.length > 0)

const buildDiffSegments = (
  left: string,
  right: string
): { left: DiffSegment[]; right: DiffSegment[] } => {
  const leftTokens = tokenizeForDiff(left)
  const rightTokens = tokenizeForDiff(right)
  const rows = leftTokens.length + 1
  const cols = rightTokens.length + 1
  const matrix = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0))

  for (let row = 1; row < rows; row += 1) {
    for (let col = 1; col < cols; col += 1) {
      if (leftTokens[row - 1] === rightTokens[col - 1]) {
        matrix[row][col] = matrix[row - 1][col - 1] + 1
      } else {
        matrix[row][col] = Math.max(matrix[row - 1][col], matrix[row][col - 1])
      }
    }
  }

  const leftDiffFlags = Array.from({ length: leftTokens.length }, () => true)
  const rightDiffFlags = Array.from({ length: rightTokens.length }, () => true)
  let row = leftTokens.length
  let col = rightTokens.length

  while (row > 0 && col > 0) {
    if (leftTokens[row - 1] === rightTokens[col - 1]) {
      leftDiffFlags[row - 1] = false
      rightDiffFlags[col - 1] = false
      row -= 1
      col -= 1
      continue
    }

    if (matrix[row - 1][col] >= matrix[row][col - 1]) {
      row -= 1
    } else {
      col -= 1
    }
  }

  const collapseSegments = (tokens: string[], flags: boolean[]): DiffSegment[] => {
    if (tokens.length === 0) {
      return []
    }

    const segments: DiffSegment[] = []
    let buffer = tokens[0]
    let currentFlag = flags[0]

    for (let index = 1; index < tokens.length; index += 1) {
      if (flags[index] === currentFlag) {
        buffer += tokens[index]
      } else {
        segments.push({ text: buffer, isDifferent: currentFlag })
        buffer = tokens[index]
        currentFlag = flags[index]
      }
    }

    segments.push({ text: buffer, isDifferent: currentFlag })
    return segments
  }

  return {
    left: collapseSegments(leftTokens, leftDiffFlags),
    right: collapseSegments(rightTokens, rightDiffFlags),
  }
}

interface SessionResultStepProps {
  session: InteractiveSessionRun
  principles: Principle[]
  onRerunSameSeed: () => void
  onNewSeedRun: () => void
}

export function SessionResultStep({
  session,
  principles,
  onRerunSameSeed,
  onNewSeedRun,
}: SessionResultStepProps) {
  const { t } = useTranslation()
  const hasContradictions = session.contradictionCount > 0
  const totalJudgments = Math.max(1, session.judgments.length)
  const consistencyScore = Math.max(
    0,
    Math.round(((session.judgments.length - session.contradictionCount) / totalJudgments) * 100)
  )

  const rankIndexById = useMemo(() => {
    const lookup = new Map<string, number>()
    session.principleRanking.forEach((id, index) => lookup.set(id, index))
    return lookup
  }, [session.principleRanking])

  const orderedJudgments = useMemo(
    () =>
      [...session.judgments]
        .map((judgment, index) => ({ judgment, index }))
        .sort((a, b) => {
          const rankA =
            rankIndexById.get(a.judgment.scenario.principleId) ?? Number.MAX_SAFE_INTEGER
          const rankB =
            rankIndexById.get(b.judgment.scenario.principleId) ?? Number.MAX_SAFE_INTEGER
          if (rankA !== rankB) {
            return rankA - rankB
          }
          return a.index - b.index
        })
        .map(({ judgment }) => judgment),
    [rankIndexById, session.judgments]
  )

  const principleStatuses = useMemo(
    () =>
      session.principleRanking.map((id) => {
        const principle = principles.find((candidate) => candidate.id === id)
        const relevant = session.judgments.filter(
          (judgment) => judgment.scenario.principleId === id
        )
        const failed = relevant.some((judgment) => !judgment.isConsistent)
        return {
          id,
          label: principle ? formatPrincipleLabel(principle.label) : id,
          tested: relevant.length > 0,
          failed,
        }
      }),
    [principles, session.judgments, session.principleRanking]
  )

  const contradictionEntries = useMemo(
    () => orderedJudgments.filter((judgment) => !judgment.isConsistent),
    [orderedJudgments]
  )

  return (
    <div className="flex flex-col px-4 py-6 sm:px-6 sm:py-8 lg:px-12">
      <div>
        <h1 className="text-2xl font-black text-white sm:text-3xl md:text-4xl">
          {t('sessionResult.title')}
        </h1>
        <div
          className={`mt-3 border-l-2 pl-3 py-1.5 font-mono text-sm ${
            session.isFlatLineVote
              ? 'border-amber-500 bg-amber-500/5'
              : hasContradictions
                ? 'border-red-500 bg-red-500/5'
                : 'border-emerald-500 bg-emerald-500/5'
          }`}
        >
          {session.isFlatLineVote ? (
            <span className="font-black text-amber-400 font-sans tracking-wide">
              {t('sessionResult.summaryFlatLine', {
                verdict:
                  session.flatLineVerdict === 'ACCEPTABLE'
                    ? t('judge.acceptable')
                    : t('judge.outrageous'),
              })}
            </span>
          ) : hasContradictions ? (
            <span className="font-black text-red-400">
              {t('sessionResult.summaryContradiction', {
                count: session.contradictionCount,
                total: session.judgments.length,
              })}
            </span>
          ) : (
            <span className="font-black text-emerald-400">
              {t('sessionResult.summaryConsistent', { total: session.judgments.length })}
            </span>
          )}
        </div>
        <p className="mt-2 font-mono text-xs text-slate-500">
          {t('sessionResult.seedUsed', { seed: session.seed })}
        </p>
      </div>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_230px_180px]">
        <div className="audit-panel rounded-lg p-5">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-300/80">
            consistency rating
          </div>
          <div className="mt-3 flex items-center gap-3 font-mono">
            <span className="text-5xl font-black text-cyan-300 sm:text-6xl">{consistencyScore}%</span>
            <span className="text-xs uppercase tracking-[0.16em] text-cyan-200">
              status: {hasContradictions ? t('sessionResult.statusPartial') : t('sessionResult.statusStable')}
            </span>
          </div>
        </div>

        <div className="audit-panel rounded-lg p-4 font-mono">
          <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
            {t('sessionResult.auditSummary')}
          </div>
          <ul className="mt-3 space-y-1.5 text-[11px] text-slate-200">
            <li>• {t('sessionResult.dilemmasProcessed')}: {session.judgments.length}</li>
            <li>• {t('sessionResult.principlesSealed')}: {session.principleRanking.length}</li>
            <li className="text-amber-300">• {t('sessionResult.divergences')}: {session.contradictionCount}</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="text-right">
            <span className="rounded border border-amber-500/60 bg-amber-500/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-amber-300">
              {t('sessionResult.sealedArchive')}
            </span>
          </div>
          <button
            type="button"
            className="w-full rounded border border-[#6b7788] bg-[#8494a8] px-3 py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] text-[#0b111a] transition hover:bg-[#94a3b8]"
          >
            {t('sessionResult.exportDossier')}
          </button>
        </div>
      </section>

      <section className="audit-panel mt-6 rounded-lg border-cyan-400/60 p-4 shadow-[0_0_25px_rgba(0,240,255,0.12)] sm:p-6">
        <div className="flex items-center gap-2 font-mono text-sm font-black text-cyan-300">
          <ShieldCheck size={15} /> {t('sessionResult.rankingRecap')}
        </div>
        <ul className="mt-4 space-y-2 font-mono text-sm">
          {principleStatuses.map((entry, index) => (
            <li
              key={entry.id}
              className="flex flex-col items-start justify-between gap-2 border-b border-[#21262d] pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:gap-3"
            >
              <span className="flex items-center gap-3 text-slate-200">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-cyan-400/50 text-xs text-cyan-300">
                  {index + 1}
                </span>
                {entry.label}
              </span>
              {!entry.tested ? (
                <span className="text-slate-500">{t('sessionResult.notTested')}</span>
              ) : entry.failed ? (
                <span className="font-black text-red-400">
                  {t('sessionResult.contradictionFound')}
                </span>
              ) : (
                <span className="font-black text-emerald-400">{t('sessionResult.consistent')}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded border border-amber-600/70 bg-[#1b1408]">
        <header className="flex items-center justify-between border-b border-amber-600/70 bg-amber-500/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#111]">
          <span>inconsistency_log.diff</span>
          <span>{t('sessionResult.contradictionDetection')}</span>
        </header>
        <div className="space-y-3 p-3">
          {contradictionEntries.length === 0 ? (
            <div className="rounded border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 font-mono text-xs text-emerald-300">
              {t('sessionResult.noDivergences')}
            </div>
          ) : (
            contradictionEntries.slice(0, 3).map((judgment, logIndex) => (
              <article
                key={`${judgment.scenario.id}-log`}
                className="rounded border border-amber-800/80 bg-[#261a0b] px-3 py-2 font-mono text-xs text-amber-100"
              >
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-300">
                  log_entry #{String(logIndex + 1).padStart(2, '0')} // conflito de vetor
                </p>
                <p className="mt-1 leading-6">
                  [DIFF] {t('sessionResult.diffCase', { count: logIndex + 1 })} // {judgment.scenario.title}. {t('sessionResult.diffPrinciple')}:{' '}
                  <span className="font-bold text-cyan-300">{formatPrincipleLabel(
                    principles.find((p) => p.id === judgment.scenario.principleId)?.label ?? judgment.scenario.principleId
                  )}</span>
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <h2 className="mt-8 font-mono text-sm font-black text-cyan-300">
        {t('sessionResult.scenarioBreakdown')}
      </h2>
      <div className="mt-4 space-y-4">
        {orderedJudgments.map((judgment, index) => (
          <JudgmentOutcomeCard
            key={judgment.scenario.id}
            judgment={judgment}
            defaultExpanded={!judgment.isConsistent && index === 0}
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRerunSameSeed}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-[#30363d] px-5 py-3 font-mono text-xs font-black text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-200 sm:w-auto"
        >
          <RefreshCw size={14} /> {t('sessionResult.rerunSameSeed')}
        </button>
        <button
          type="button"
          onClick={onNewSeedRun}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-400 px-5 py-3 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
        >
          <Zap size={14} /> {t('sessionResult.newSeedRun')}
        </button>
      </div>

      <footer className="mt-8 flex flex-col gap-2 font-mono text-sm text-slate-400 sm:flex-row sm:justify-between">
        <span className="text-cyan-400">{t('sessionResult.analysisComplete')}</span>
        <span>culture-lint v2026.3.2</span>
      </footer>
    </div>
  )
}

function JudgmentOutcomeCard({
  judgment,
  defaultExpanded,
}: {
  judgment: ScenarioJudgment
  defaultExpanded: boolean
}) {
  const { t } = useTranslation()
  const [expanded, setExpanded] = useState(defaultExpanded)
  const { scenario, verdictA, verdictB, isConsistent } = judgment
  const hasFailed = !isConsistent
  const subjectDiff = useMemo(
    () => buildDiffSegments(scenario.caseStudyA.subject, scenario.caseStudyB.subject),
    [scenario.caseStudyA.subject, scenario.caseStudyB.subject]
  )
  const actDiff = useMemo(
    () => buildDiffSegments(scenario.caseStudyA.act, scenario.caseStudyB.act),
    [scenario.caseStudyA.act, scenario.caseStudyB.act]
  )
  const contextDiff = useMemo(
    () => buildDiffSegments(scenario.caseStudyA.context, scenario.caseStudyB.context),
    [scenario.caseStudyA.context, scenario.caseStudyB.context]
  )

  return (
    <section
      className={`audit-panel overflow-hidden rounded-lg border ${
        hasFailed ? 'border-red-500/50' : 'border-emerald-500/40'
      }`}
    >
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full flex-wrap items-center justify-between gap-3 px-4 py-4 text-left sm:px-5"
      >
        <span className="min-w-0">
          <span className="block truncate font-bold text-white">{scenario.title}</span>
          <span className="mt-1 block font-mono text-xs text-slate-500">[{scenario.category}]</span>
        </span>
        <span className="flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className={`rounded border px-2 py-1 font-mono text-[10px] font-black sm:text-xs ${
              hasFailed
                ? 'border-red-400/70 text-red-400'
                : 'border-emerald-400/70 text-emerald-400'
            }`}
          >
            {hasFailed ? t('sessionResult.doubleStandard') : t('sessionResult.consistentBadge')}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition ${expanded ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {expanded && (
        <div className="border-t border-[#21262d] bg-black/60 p-4 sm:p-5">
          {hasFailed && (
            <div className="mb-4 rounded border border-amber-400/40 bg-amber-400/10 px-3 py-2 font-mono text-xs text-amber-200">
              {t('sessionResult.highlightedDifferences')}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <VerdictCell
              label={t('sessionResult.eventA')}
              caseStudy={scenario.caseStudyA}
              verdict={verdictA}
              highlightDifferences={hasFailed}
              subjectSegments={subjectDiff.left}
              actSegments={actDiff.left}
              contextSegments={contextDiff.left}
            />
            <VerdictCell
              label={t('sessionResult.eventB')}
              caseStudy={scenario.caseStudyB}
              verdict={verdictB}
              highlightDifferences={hasFailed}
              subjectSegments={subjectDiff.right}
              actSegments={actDiff.right}
              contextSegments={contextDiff.right}
            />
          </div>
          <div
            className={`mt-4 rounded border p-4 font-mono text-xs leading-6 sm:text-sm ${
              hasFailed
                ? 'border-red-500/50 text-red-300'
                : 'border-emerald-500/40 text-emerald-300'
            }`}
          >
            {hasFailed ? t('sessionResult.contradictionNote') : t('sessionResult.consistentNote')}
          </div>
        </div>
      )}
    </section>
  )
}

interface VerdictCellProps {
  label: string
  caseStudy: { subject: string; act: string; context: string }
  verdict: JudgmentVerdict
  highlightDifferences: boolean
  subjectSegments: DiffSegment[]
  actSegments: DiffSegment[]
  contextSegments: DiffSegment[]
}

function VerdictCell({
  label,
  caseStudy,
  verdict,
  highlightDifferences,
  subjectSegments,
  actSegments,
  contextSegments,
}: VerdictCellProps) {
  const { t } = useTranslation()
  const isOutrageous = verdict === 'OUTRAGEOUS'
  const renderText = (segments: DiffSegment[], fallbackText: string, className: string) => {
    if (!highlightDifferences) {
      return <p className={className}>{fallbackText}</p>
    }

    return (
      <p className={className}>
        {segments.map((segment, index) => (
          <span
            key={`${segment.text}-${index}`}
            className={
              segment.isDifferent ? 'rounded-sm bg-amber-400/20 px-0.5 text-amber-100' : undefined
            }
          >
            {segment.text}
          </span>
        ))}
      </p>
    )
  }

  return (
    <div className="rounded border border-[#21262d] bg-[#0c0f1c] p-4 font-mono text-xs leading-6 text-slate-300 sm:text-sm">
      <p className="text-xs font-black text-slate-500">{label}</p>
      {renderText(subjectSegments, caseStudy.subject, 'mt-2 text-slate-200')}
      {renderText(actSegments, caseStudy.act.toLowerCase(), 'mt-1 text-slate-400')}
      {renderText(contextSegments, caseStudy.context.toLowerCase(), 'mt-1 text-slate-500')}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-slate-500">{t('sessionResult.yourVerdict')}</span>
        <span
          className={`rounded border px-2 py-0.5 font-black ${
            isOutrageous
              ? 'border-red-400/70 text-red-400'
              : 'border-emerald-400/70 text-emerald-400'
          }`}
        >
          {isOutrageous ? t('judge.outrageous') : t('judge.acceptable')}
        </span>
      </div>
    </div>
  )
}
