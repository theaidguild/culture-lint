import type { Principle, ScenarioPreset } from '../types/linter';

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

export const runCultureLint = (principle: Principle, scenario: ScenarioPreset): LintRunResult => {
  console.log(`[INFO] Evaluating Baseline: ${principle.value}`);
  console.log('[PASS] Case Study A matches rule system integrity.');

  if (scenario.caseStudyA.expectedReaction !== scenario.caseStudyB.expectedReaction) {
    return {
      status: 'FAILED',
      exception: scenario.exceptionType,
      code: scenario.exceptionCode,
      description: `The property 'Reaction' mutated dynamically from '${scenario.caseStudyA.expectedReaction}' to '${scenario.caseStudyB.expectedReaction}' without structural payload variance.`,
    };
  }

  return { status: 'SUCCESS' };
};
