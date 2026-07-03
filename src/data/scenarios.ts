// src/data/scenarios.ts
import { type ScenarioPreset } from '../types/linter';

export const SCENARIO_DATABASE: ScenarioPreset[] = [
  // ==========================================================================
  // CATEGORY: HYPOCRITE INCLUSIVENESS / PERFORMATIVE DIVERSITY LOOP
  // ==========================================================================
  {
    id: 'inclusividade-seletiva',
    principleId: 'equality', // Links to equality rule in App.tsx
    title: 'The Safe Space Gatekeeper Protocol',
    category: 'SO-BR/INCLUSION',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_901',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'A corporate panel or cultural collective declaring "Absolute, Unconditional Intellectual and Social Diversity"',
      act: 'Invites a minority creator who holds strict, traditional conservative socio-economic beliefs to lecture',
      context: 'The speaker uses polite, standard corporate language but advocates for free-market capitalism and traditional family structures',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'This is an unsafe intrusion; diversity does not mean tolerating systemic oppression or harmful, regressive dogmas.'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'The exact same corporate panel or cultural collective declaring "Absolute, Unconditional Intellectual and Social Diversity"',
      act: 'Invites an affluent, upper-class creator who holds matching institutional, progress-aligned socio-economic beliefs to lecture',
      context: 'The speaker uses polite, standard corporate language to echo the existing ideological framework of the room',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'A beautiful, harmonious validation of shared human empathy and progressive alignment. This is what true inclusion feels like.'
    }
  },
  {
    id: 'cancelamento-do-bem',
    principleId: 'transparency', // Links to transparency rule in App.tsx
    title: 'The Empathy Exception Compiler',
    category: 'SO-BR/INCLUSION',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_902',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'A prominent social media user with a bio reading: "Empathy, Love, and Mental Health advocate. #SetembroAmarelo"',
      act: 'Discovers an opposing political influencer going through an intense public scandal or severe personal crisis',
      context: 'The user actively likes, retweets, and crafts public mockery mocking the opponent\'s mental breakdown and ruined career',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'They are reaping what they sowed; tyrants, bigots, and bad people do not deserve human empathy or psychological protection.'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'The exact same social media user with a bio reading: "Empathy, Love, and Mental Health advocate. #SetembroAmarelo"',
      act: 'Discovers an allied political influencer going through an identical public scandal or severe personal crisis',
      context: 'The user actively likes, retweets, and crafts public mockery attacking the journalists covering the scandal',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'We must protect human dignity; cyberbullying is a disease, and we never know what kind of silent psychological battles people are fighting.'
    }
  },

  // ==========================================================================
  // CATEGORY: LAW & CONSTITUTIONAL DYNAMICS
  // ==========================================================================
  {
    id: 'stf-due-process',
    principleId: 'accountability', // Links to accountability rule in App.tsx
    title: 'Judicial Activism Sandbox',
    category: 'PR-BR/CONST',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_201',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'A prominent political opponent',
      act: 'Has their social media accounts suspended overnight by a single judicial order without a formal trial',
      context: 'Suspended without formal trial or broad defense opportunity under accelerated executive legal mandates',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'Flagrant abuse of power, tactical authoritarianism, and a dark era of judicial dictatorship ("Ditadura do Judiciário").'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'A prominent political ally',
      act: 'Has their social media accounts suspended overnight by a single judicial order without a formal trial',
      context: 'Suspended without formal trial or broad defense opportunity under accelerated executive legal mandates',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'An exceptional, highly necessary measure to protect structural democratic institutions from systemic sabotage ("Defesa da Democracia").'
    }
  },

  // ==========================================================================
  // CATEGORY: ECONOMIC RESPONSIBILITY
  // ==========================================================================
  {
    id: 'corrupcao-estimada',
    principleId: 'accountability',
    title: 'The Budget Divergence Evaluator',
    category: 'PR-BR/ECON',
    exceptionType: 'TypeMismatchException',
    exceptionCode: 'CL_SEM_305',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'Opposing Legislative Coalition / Centrão',
      act: 'Negotiating massive public budget allocations for regional infrastructure in exchange for vital legislative votes',
      context: 'Standard legislative coalition building via targeted localized budgetary distribution programs',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'Institutional corruption, legalized bribery, buying political power while starving public healthcare and basic education systems.'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'Preferred Legislative Coalition / Government',
      act: 'Negotiating massive public budget allocations for regional infrastructure in exchange for vital legislative votes',
      context: 'Standard legislative coalition building via targeted localized budgetary distribution programs',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'Pragmatic governance, coalition presidentialism, and necessary political articulation to pass fundamental structural reforms.'
    }
  },

  // ==========================================================================
  // CATEGORY: SOCIO-CULTURAL & MEDIA FREQUENCIES
  // ==========================================================================
  {
    id: 'liberdade-expressao-seletiva',
    principleId: 'transparency',
    title: 'The Free Speech Elasticity Linter',
    category: 'SO-BR/CULTURE',
    exceptionType: 'ShiftingLogicException',
    exceptionCode: 'CL_SEM_601',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'An opposing ideological content creator or media comedian',
      act: 'Makes a deeply offensive, highly provocative public joke targeting a protected demographic or historical event',
      context: 'The comment is made during a heavily publicized live stream, sparking massive societal backlash across networks',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'This is completely distinct from humor; it is explicit hate speech, digital violence, and requires immediate judicial deplatforming.'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'A preferred political satirist or avant-garde artistic performer',
      act: 'Makes a deeply offensive, highly provocative public joke targeting a protected demographic or historical event',
      context: 'The comment is made during a heavily publicized live stream, sparking massive societal backlash across networks',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'A vital, transgressive display of artistic freedom and sharp social critique. Protecting this expression is a triumph for democracy.'
    }
  },
  {
    id: 'seguranca-publica-seletiva',
    principleId: 'equality',
    title: 'The State Monopoly on Force Verifier',
    category: 'SO-BR/GOV',
    exceptionType: 'NullPointerException',
    exceptionCode: 'CL_SEM_812',
    caseStudyA: {
      type: 'RIVAL',
      subject: 'A localized public protest or logistical blockade organized by rural farmers and independent truckers',
      act: 'Disrupts regional logistics, ignites tires on national highways, and forces critical public transit routes to a complete halt',
      context: 'The demonstration is non-violent but deliberately engineers total infrastructure friction for an extended period',
      expectedReaction: 'Absolute Outrage',
      justificationLogic: 'Domestic economic terrorism, a flagrant violation of the constitutional right to mobility, and the state must deploy police shock troops immediately.'
    },
    caseStudyB: {
      type: 'ALLY',
      subject: 'A localized public protest or logistical blockade organized by urban student unions and historic social movements',
      act: 'Disrupts regional logistics, ignites tires on national highways, and forces critical public transit routes to a complete halt',
      context: 'The demonstration is non-violent but deliberately engineers total infrastructure friction for an extended period',
      expectedReaction: 'Nuanced Defense',
      justificationLogic: 'A historic, deeply justified democratic manifestation fighting for human rights. Any deployment of state police force is structural fascism.'
    }
  }
];