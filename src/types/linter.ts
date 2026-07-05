export type Principle = {
  id: string
  label: string
  status: string
  metadata: string[]
  value: string
  code: string
}

export type CaseStudy = {
  type: 'RIVAL' | 'ALLY'
  subject: string
  act: string
  context: string
  expectedReaction: string
  justificationLogic: string
}

export type ScenarioPreset = {
  id: string
  principleId: string
  title: string
  category: string
  caseStudyA: CaseStudy
  caseStudyB: CaseStudy
  exceptionCode: string
  exceptionType: 'ShiftingLogicException' | 'TypeMismatchException' | 'NullPointerException'
}

// The user's binary verdict on a single act.
export type JudgmentVerdict = 'ACCEPTABLE' | 'OUTRAGEOUS'

// One act presented for judgment. Each scenario contributes two of these
// (its rival act and its ally act); they are shuffled so the mirrored pairing
// is not obvious while the user is answering.
export type JudgmentItem = {
  id: string
  scenarioId: string
  caseKey: 'A' | 'B'
  subject: string
  act: string
  context: string
}

// The comparison of the user's own verdicts on a scenario's two mirrored acts.
export type ScenarioJudgment = {
  scenario: ScenarioPreset
  principle: Principle
  verdictA: JudgmentVerdict
  verdictB: JudgmentVerdict
  isConsistent: boolean
}

// A full deterministic session: the seed, the user's principle ranking,
// and the evaluated judgments derived from the user's own answers.
export type InteractiveSessionRun = {
  seed: string
  principleRanking: string[]
  judgments: ScenarioJudgment[]
  consistentCount: number
  contradictionCount: number
  isFlatLineVote?: boolean
  flatLineVerdict?: JudgmentVerdict
}
