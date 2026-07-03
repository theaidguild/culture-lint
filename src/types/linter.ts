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
