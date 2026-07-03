export type Principle = {
  id: string;
  label: string;
  status: string;
  metadata: string[];
  value: string;
  code: string;
};

export type CaseStudy = {
  type: 'RIVAL' | 'ALLY';
  subject: string;
  act: string;
  context: string;
  expectedReaction: string;
  justificationLogic: string;
};

export type ScenarioPreset = {
  id: string;
  principleId: string;
  title: string;
  category: string;
  caseStudyA: CaseStudy;
  caseStudyB: CaseStudy;
  exceptionCode: string;
  exceptionType: 'ShiftingLogicException' | 'TypeMismatchException' | 'NullPointerException';
};

// Outcome of linting a single scenario within a session queue.
export type ScenarioRunOutcome = {
  scenario: ScenarioPreset;
  principle: Principle;
  result: LintResult;
};

// A full deterministic session: the seed, the user's principle ranking,
// and the outcome of every scenario in the queue.
export type SessionRun = {
  seed: string;
  principleRanking: string[];
  outcomes: ScenarioRunOutcome[];
  passedCount: number;
  failedCount: number;
};

// Shared shape for a lint result, mirrored by the engine's LintRunResult.
export type LintResult =
  | {
      status: 'FAILED';
      exception: ScenarioPreset['exceptionType'];
      code: string;
      description: string;
    }
  | {
      status: 'SUCCESS';
    };
