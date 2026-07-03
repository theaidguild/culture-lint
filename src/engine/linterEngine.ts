import type { LintResult, Principle, ScenarioPreset, ScenarioRunOutcome, SessionRun } from '../types/linter';
import { createRng, shuffleWithRng } from './random';

type ReactionMutationDescriptionParams = {
  fromReaction: string;
  toReaction: string;
};

type RunCultureLintOptions = {
  formatReactionMutationDescription?: (params: ReactionMutationDescriptionParams) => string;
};

export type LintRunResult = LintResult;

export const runCultureLint = (
  principle: Principle,
  scenario: ScenarioPreset,
  options: RunCultureLintOptions = {},
): LintRunResult => {
  console.log(`[INFO] Evaluating Baseline: ${principle.value}`);
  console.log('[PASS] Case Study A matches rule system integrity.');

  if (scenario.caseStudyA.expectedReaction !== scenario.caseStudyB.expectedReaction) {
    const description =
      options.formatReactionMutationDescription?.({
        fromReaction: scenario.caseStudyA.expectedReaction,
        toReaction: scenario.caseStudyB.expectedReaction,
      }) ??
      `The property 'Reaction' mutated dynamically from '${scenario.caseStudyA.expectedReaction}' to '${scenario.caseStudyB.expectedReaction}' without structural payload variance.`;

    return {
      status: 'FAILED',
      exception: scenario.exceptionType,
      code: scenario.exceptionCode,
      description,
    };
  }

  return { status: 'SUCCESS' };
};

type BuildSessionQueueParams = {
  seed: string;
  scenarios: ScenarioPreset[];
  size?: number;
};

// Deterministically order the scenario pool for a session. The same seed
// always yields the same queue, so a run can be reproduced or shared.
export const buildSessionQueue = ({ seed, scenarios, size }: BuildSessionQueueParams): ScenarioPreset[] => {
  const rng = createRng(seed);
  const shuffled = shuffleWithRng(scenarios, rng);
  const limit = size ?? shuffled.length;
  return shuffled.slice(0, Math.max(1, Math.min(limit, shuffled.length)));
};

type RunCultureLintSessionParams = {
  seed: string;
  principleRanking: string[];
  queue: ScenarioPreset[];
  resolvePrinciple: (principleId: string) => Principle;
  options?: RunCultureLintOptions;
};

// Execute a full session: lint every scenario in the queue against its own
// principle and aggregate the outcomes into a reproducible SessionRun.
export const runCultureLintSession = ({
  seed,
  principleRanking,
  queue,
  resolvePrinciple,
  options = {},
}: RunCultureLintSessionParams): SessionRun => {
  const outcomes: ScenarioRunOutcome[] = queue.map((scenario) => {
    const principle = resolvePrinciple(scenario.principleId);
    return {
      scenario,
      principle,
      result: runCultureLint(principle, scenario, options),
    };
  });

  const failedCount = outcomes.filter((outcome) => outcome.result.status === 'FAILED').length;

  return {
    seed,
    principleRanking,
    outcomes,
    failedCount,
    passedCount: outcomes.length - failedCount,
  };
};
