import type {
  InteractiveSessionRun,
  JudgmentItem,
  JudgmentVerdict,
  Principle,
  ScenarioJudgment,
  ScenarioPreset,
} from '../types/linter'
import { createRng, shuffleWithRng } from './random'

type BuildJudgmentSequenceParams = {
  seed: string
  scenarios: ScenarioPreset[]
}

// Build a deterministic, shuffled sequence of individual acts to judge.
// Each scenario contributes two items (its rival act and its ally act); the
// shuffle interleaves them so the mirrored pairing is hard to notice while the
// user is answering. The same seed always yields the same order.
export const buildJudgmentSequence = ({
  seed,
  scenarios,
}: BuildJudgmentSequenceParams): JudgmentItem[] => {
  const items = scenarios.flatMap<JudgmentItem>((scenario) => [
    {
      id: `${scenario.id}:A`,
      scenarioId: scenario.id,
      caseKey: 'A',
      subject: scenario.caseStudyA.subject,
      act: scenario.caseStudyA.act,
      context: scenario.caseStudyA.context,
    },
    {
      id: `${scenario.id}:B`,
      scenarioId: scenario.id,
      caseKey: 'B',
      subject: scenario.caseStudyB.subject,
      act: scenario.caseStudyB.act,
      context: scenario.caseStudyB.context,
    },
  ])

  return shuffleWithRng(items, createRng(seed))
}

type EvaluateInteractiveSessionParams = {
  seed: string
  principleRanking: string[]
  scenarios: ScenarioPreset[]
  answers: Record<string, JudgmentVerdict>
  resolvePrinciple: (principleId: string) => Principle
}

// Compare the user's own verdicts on each scenario's two mirrored acts.
// A contradiction is a scenario whose structurally identical acts received
// different verdicts, revealing an identity-based double standard.
export const evaluateInteractiveSession = ({
  seed,
  principleRanking,
  scenarios,
  answers,
  resolvePrinciple,
}: EvaluateInteractiveSessionParams): InteractiveSessionRun => {
  const judgments: ScenarioJudgment[] = []

  for (const scenario of scenarios) {
    const verdictA = answers[`${scenario.id}:A`]
    const verdictB = answers[`${scenario.id}:B`]
    if (!verdictA || !verdictB) {
      continue
    }

    judgments.push({
      scenario,
      principle: resolvePrinciple(scenario.principleId),
      verdictA,
      verdictB,
      isConsistent: verdictA === verdictB,
    })
  }

  const contradictionCount = judgments.filter((judgment) => !judgment.isConsistent).length

  const verifiedAnswers: JudgmentVerdict[] = []
  for (const scenario of scenarios) {
    const verdictA = answers[`${scenario.id}:A`]
    const verdictB = answers[`${scenario.id}:B`]
    if (verdictA) verifiedAnswers.push(verdictA)
    if (verdictB) verifiedAnswers.push(verdictB)
  }

  const uniqueAnswers = new Set(verifiedAnswers)
  const isFlatLineVote = verifiedAnswers.length > 0 && uniqueAnswers.size === 1
  const flatLineVerdict = isFlatLineVote ? Array.from(uniqueAnswers)[0] : undefined

  return {
    seed,
    principleRanking,
    judgments,
    contradictionCount,
    consistentCount: judgments.length - contradictionCount,
    isFlatLineVote,
    flatLineVerdict,
  }
}
