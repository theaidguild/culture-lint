import type { Principle, ScenarioPreset } from '../types/linter';

type ReactionMutationDescriptionParams = {
  fromReaction: string;
  toReaction: string;
};

type RunCultureLintOptions = {
  formatReactionMutationDescription?: (params: ReactionMutationDescriptionParams) => string;
};

export type LintRunResult =
  | {
      status: 'FAILED';
      exception: ScenarioPreset['exceptionType'];
      code: string;
      description: string;
    }
  | {
      status: 'SUCCESS';
    };

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
