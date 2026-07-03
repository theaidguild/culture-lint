import type { TFunction } from 'i18next'
import { type CaseStudy, type ScenarioPreset } from '../types/linter'

const STATIC_SCENARIOS = [
  {
    id: 'inclusividade-seletiva',
    principleId: 'equality',
    category: 'SO-BR/INCLUSION',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_901',
  },
  {
    id: 'cancelamento-do-bem',
    principleId: 'transparency',
    category: 'SO-BR/INCLUSION',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_902',
  },
  {
    id: 'stf-due-process',
    principleId: 'accountability',
    category: 'PR-BR/CONST',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_201',
  },
  {
    id: 'corrupcao-estimada',
    principleId: 'accountability',
    category: 'PR-BR/ECON',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_305',
  },
  {
    id: 'liberdade-expressao-seletiva',
    principleId: 'transparency',
    category: 'SO-BR/CULTURE',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_601',
  },
  {
    id: 'seguranca-publica-seletiva',
    principleId: 'equality',
    category: 'SO-BR/GOV',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_812',
  },
  {
    id: 'vazamento-privacidade',
    principleId: 'transparency',
    category: 'PR-BR/POLITICS',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1001',
  },
  {
    id: 'racismo-e-linguagem',
    principleId: 'equality',
    category: 'SO-BR/RACISM',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1002',
  },
  {
    id: 'tolerancia-religiosa',
    principleId: 'equality',
    category: 'SO-BR/RELIGION',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1003',
  },
  {
    id: 'identidade-sexual-paradox',
    principleId: 'accountability',
    category: 'SO-BR/SEXUALITY',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1004',
  },
] as const satisfies Array<
  Pick<ScenarioPreset, 'id' | 'principleId' | 'category' | 'exceptionType' | 'exceptionCode'>
>

const localizeReaction = (t: TFunction, type: 'RIVAL' | 'ALLY') =>
  type === 'RIVAL' ? t('reactions.absoluteOutrage') : t('reactions.nuancedDefense')

const localizeCaseStudy = (t: TFunction, scenarioId: string, caseKey: 'A' | 'B'): CaseStudy => {
  const casePath = `scenarios.${scenarioId}.caseStudy${caseKey}`
  const type: CaseStudy['type'] = caseKey === 'A' ? 'RIVAL' : 'ALLY'

  return {
    type,
    subject: t(`${casePath}.subject`),
    act: t(`${casePath}.act`),
    context: t(`${casePath}.context`),
    expectedReaction: localizeReaction(t, type),
    justificationLogic: t(`${casePath}.justificationLogic`),
  }
}

export const getScenarioDatabase = (t: TFunction): ScenarioPreset[] => {
  return STATIC_SCENARIOS.map((scenario) => ({
    ...scenario,
    title: t(`scenarios.${scenario.id}.title`),
    caseStudyA: localizeCaseStudy(t, scenario.id, 'A'),
    caseStudyB: localizeCaseStudy(t, scenario.id, 'B'),
  }))
}
