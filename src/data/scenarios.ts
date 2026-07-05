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
  },  {
    id: 'fura-fila-saude',
    principleId: 'equality',
    category: 'SO-BR/HEALTHCARE',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1101',
  },
  {
    id: 'perturbacao-sossego-comunidade',
    principleId: 'equality',
    category: 'SO-BR/NEIGHBORHOOD',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1102',
  },
  {
    id: 'alerta-fake-news-whatsapp',
    principleId: 'transparency',
    category: 'SO-BR/COMMUNICATION',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1103',
  },
  {
    id: 'furto-fome-supermercado',
    principleId: 'equality',
    category: 'SO-BR/SECURITY',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1104',
  },
  {
    id: 'mentira-politica-eleitor',
    principleId: 'accountability',
    category: 'SO-BR/POLITICS',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1105',
  },
  {
    id: 'presente-agrado-reparticao',
    principleId: 'transparency',
    category: 'SO-BR/PUBLIC_SERVICE',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1106',
  },
  {
    id: 'cancelamento-critica-influenciador',
    principleId: 'equality',
    category: 'SO-BR/SOCIAL_MEDIA',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1201',
  },
  {
    id: 'divisao-conta-streaming',
    principleId: 'transparency',
    category: 'SO-BR/CULTURE_DIGITAL',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1202',
  },
  {
    id: 'meme-inteligencia-artificial',
    principleId: 'accountability',
    category: 'SO-BR/TECHNOLOGY',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1203',
  },
  {
    id: 'pesquisa-cientifica-financiada',
    principleId: 'transparency',
    category: 'SO-BR/SCIENCE',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1301',
  },
  {
    id: 'especie-invasora-conservacao',
    principleId: 'equality',
    category: 'SO-BR/BIOLOGY',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1302',
  },
  {
    id: 'patente-remedio-indigena',
    principleId: 'accountability',
    category: 'SO-BR/ENV_LAW',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1303',
  },
  {
    id: 'cuidados-pais-idosos',
    principleId: 'accountability',
    category: 'SO-BR/FAMILY',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1107',
  },
  {
    id: 'partilha-heranca-familiar',
    principleId: 'equality',
    category: 'SO-BR/FAMILY_LAW',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1108',
  },
  {
    id: 'trabalho-faculdade-credito',
    principleId: 'accountability',
    category: 'SO-BR/EDUCATION',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1204',
  },
  {
    id: 'alimentacao-vegana-boicote',
    principleId: 'equality',
    category: 'SO-BR/VEGANISM',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1205',
  },
  {
    id: 'consumo-fast-fashion',
    principleId: 'transparency',
    category: 'SO-BR/CONSUMPTION',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1206',
  },
  {
    id: 'zoologico-conservacao-bem-estar',
    principleId: 'equality',
    category: 'SO-BR/ZOO',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_1304',
  },
  {
    id: 'divulgacao-cientifica-alerta',
    principleId: 'transparency',
    category: 'SO-BR/SCIENCE_COMM',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_1305',
  },
  {
    id: 'coleta-especime-licenca',
    principleId: 'accountability',
    category: 'SO-BR/BIO_COLLECT',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_1306',
  },] as const satisfies Array<
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
