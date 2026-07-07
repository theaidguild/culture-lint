import { type ScenarioPreset } from '../types/linter'
import i18n from '../i18n'

export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brazil / Brasil' },
  { code: 'US', name: 'United States / EUA' },
  { code: 'FR', name: 'France / França' },
  { code: 'UK', name: 'United Kingdom / Reino Unido' },
  { code: 'JP', name: 'Japan / Japão' },
]

export const MODEL_PRESETS = {
  qwen257b: 'qwen2.5:7b',
} as const

export type ModelPresetId = keyof typeof MODEL_PRESETS

export type GenerationPhase = 'idle' | 'downloading' | 'compiling' | 'generating' | 'done'
export type GenerationUiStage = 'preparing' | 'drafting' | 'refining' | 'finalizing' | 'done'
type ControversyAcceptanceMode = 'strict' | 'relaxed' | 'fallback'
type ScenarioValidationMode = 'strict' | 'relaxed' | 'fallback'
type ScenarioTopic = 'religion' | 'abortion'

interface TopicQuota {
  topic: ScenarioTopic
  minimum: number
}

export interface GenerationProgress {
  phase: GenerationPhase
  percent: number
  label: string
  uiStage?: GenerationUiStage
  itemsCompleted?: number
  itemsTotal?: number
}

interface RawScenario {
  title: string
  act: string
  rival: string
  ally: string
  context: string
}

const RUNPOD_MAX_GENERATION_ATTEMPTS = 3

const CONTROVERSY_CONFLICT_TERMS_EN = [
  'censor',
  'ban',
  'blacklist',
  'nepot',
  'favorit',
  'bribe',
  'corrupt',
  'leak',
  'lie',
  'mislead',
  'cover up',
  'surveil',
  'dox',
  'boycott',
  'retaliat',
  'harass',
  'discrimin',
  'exploit',
  'conflict of interest',
  'propaganda',
]

const CONTROVERSY_CONFLICT_TERMS_PT = [
  'censur',
  'banir',
  'vetar',
  'boicot',
  'nepot',
  'favorec',
  'suborn',
  'propina',
  'corrup',
  'vazamento',
  'mentira',
  'omitir',
  'encobrir',
  'espionar',
  'perseguir',
  'assedi',
  'discrimin',
  'explora',
  'conflito de interesse',
  'manipula',
  // common model vocabulary not covered above
  'fraude',
  'abuso',
  'ilegal',
  'irregularidade',
  'desvio',
  'improbidade',
  'violar',
  'infringir',
  'ocultar',
  'silenciar',
  'intimidar',
  'ameac',
  'coagir',
  'dados pessoais',
  'privacidade',
  'sigilos',
  'superfatur',
  'licitac',
  'conluio',
  'delacao',
  'denunci',
  'retaliacao',
  'persecucao',
  'caluni',
  'difamar',
  'vender dados',
  'vendeu dados',
  'vazou',
  'vazando',
]

const CONTROVERSY_INSTITUTION_TERMS_EN = [
  'government',
  'court',
  'police',
  'school',
  'university',
  'hospital',
  'company',
  'union',
  'church',
  'media',
  'platform',
  'city council',
]

const CONTROVERSY_INSTITUTION_TERMS_PT = [
  'governo',
  'prefeitura',
  'camara',
  'tribunal',
  'justica',
  'policia',
  'escola',
  'universidade',
  'hospital',
  'empresa',
  'sindicato',
  'igreja',
  'midia',
  'plataforma',
  // additional institutions commonly referenced
  'ministerio',
  'secretaria',
  'orgao',
  'conselho',
  'autarquia',
  'fundacao',
  'rede social',
  'tecnologia',
  'corporacao',
  'instituicao',
  'departamento',
  'agencia',
  'entidade',
  'partido',
  'senado',
  'congresso',
]

const SAFE_CIVICS_TERMS_EN = [
  'recycling campaign',
  'volunteer event',
  'awareness campaign',
  'community clean up',
  'charity donation',
  'peaceful dialogue',
  'respectful discussion',
]

const SAFE_CIVICS_TERMS_PT = [
  'campanha de recicl',
  'evento volunt',
  'campanha de conscient',
  'limpeza comunit',
  'doacao beneficente',
  'dialogo respeitoso',
  'debate cordial',
]

const RELIGION_TERMS_EN = [
  'religion',
  'religious',
  'church',
  'temple',
  'mosque',
  'synagogue',
  'faith',
  'pastor',
  'priest',
  'imam',
  'rabbi',
  'evangelical',
  'catholic',
  'spiritual',
  'blasphemy',
]

const RELIGION_TERMS_PT = [
  'religiao',
  'religios',
  'igreja',
  'templo',
  'mesquita',
  'sinagoga',
  'fe',
  'pastor',
  'padre',
  'bispo',
  'evangelic',
  'catolic',
  'espirit',
  'blasfem',
]

const ABORTION_TERMS_EN = [
  'abortion',
  'abortions',
  'aborted',
  'aborting',
  'pregnancy termination',
  'termination of pregnancy',
  'pro-choice',
  'pro life',
]

const ABORTION_TERMS_PT = [
  'aborto',
  'abortamento',
  'interrupcao da gravidez',
  'interrupcao de gravidez',
  'interrupcao gestacional',
  'pro escolha',
  'pro-vida',
]

type LocalAIModelListResponse = {
  data?: Array<{ id?: string }>
}

type LocalAIChatCompletionsResponse = {
  choices?: Array<{
    message?: {
      content?: string
    }
  }>
}

const AI_DEBUG_PREFIX = '[ai-debug][generator]'
const DEFAULT_RUNPOD_BASE_PATH = '/api/runpod'
const DEFAULT_RUNPOD_TIMEOUT_MS = 90000

let runpodModelsCache: Promise<string[]> | null = null

function debugLog(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
}

function tStatus(language: 'en-US' | 'pt-BR', key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, { lng: language, ...options })
}

export function resolveSafeModelId(requested?: ModelPresetId): ModelPresetId {
  return requested ?? 'qwen257b'
}

export function resolveSafeScenarioCount(requestedCount: number): number {
  const bounded = Math.max(1, Math.floor(requestedCount))
  return bounded
}

export function suggestDefaultModelId(): ModelPresetId {
  return 'qwen257b'
}

export interface AIScenarioGeneratorConfig {
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleIds: string[]
  count: number
  model?: ModelPresetId
  signal?: AbortSignal
  onProgress?: (progress: GenerationProgress) => void
  onToken?: (chunk: string) => void
}

function stripFences(text: string): string {
  return text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
}

function repairMalformedJson(text: string): string {
  let repaired = text
  repaired = repaired.replace(
    /([A-Za-z0-9).!?])\s*,\s*"(title|act|rival|ally|context)"\s*:/g,
    '$1","$2":'
  )
  repaired = repaired.replace(/"\s*,\s*"(title|act|rival|ally|context)"\s*:/g, '","$1":')
  return repaired
}

function tryParse(slice: string): unknown[] | null {
  const attempts = [
    slice,
    slice.replace(/,\s*(\]|\})/g, '$1'),
    repairMalformedJson(slice),
    repairMalformedJson(slice).replace(/,\s*(\]|\})/g, '$1'),
  ]

  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
    } catch {
      // try next variant
    }
  }
  return null
}

function parseDirectJson(text: string): unknown[] | null {
  const attempts = [text, repairMalformedJson(text)]
  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
      if (typeof parsed === 'string') {
        const inner = parsed.trim()
        if (!inner) return null
        const parsedInner = JSON.parse(repairMalformedJson(inner))
        if (Array.isArray(parsedInner)) return parsedInner
        if (parsedInner && typeof parsedInner === 'object') return [parsedInner]
      }
    } catch {
      // fall through
    }
  }
  return null
}

function extractObjects(text: string): unknown[] | null {
  const results: unknown[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escape = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '{') {
      if (depth === 0) start = i
      depth += 1
      continue
    }

    if (ch === '}') {
      depth -= 1
      if (depth === 0 && start >= 0) {
        const slice = text.slice(start, i + 1)
        const attempts = [slice, slice.replace(/,\s*(\]|\})/g, '$1')]
        for (const attempt of attempts) {
          try {
            results.push(JSON.parse(attempt))
            break
          } catch {
            // try next object variant
          }
        }
        start = -1
      }
    }
  }

  return results.length > 0 ? results : null
}

function extractJsonArray(rawText: string): unknown[] | null {
  const text = stripFences(rawText)
  const direct = parseDirectJson(text)
  if (direct) return direct

  const start = text.indexOf('[')
  if (start < 0) return extractObjects(text)

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]

    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\') {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '[') depth += 1
    else if (ch === ']') {
      depth -= 1
      if (depth === 0) {
        const parsed = tryParse(text.slice(start, i + 1))
        if (parsed) return parsed
        break
      }
    }
  }

  return extractObjects(text)
}

function normalizeKey(rawKey: string): string {
  return rawKey
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function isStringWithMinLength(v: unknown, minLength: number): v is string {
  return typeof v === 'string' && v.trim().length >= minLength
}

function getStringByAliases(
  obj: Record<string, unknown>,
  aliases: string[],
  deepSearch = false,
  minLength = 4
): string | null {
  const aliasSet = new Set(aliases)

  for (const [key, value] of Object.entries(obj)) {
    if (!aliasSet.has(normalizeKey(key))) continue
    if (isStringWithMinLength(value, minLength)) return value.trim()
  }

  if (!deepSearch) return null

  for (const value of Object.values(obj)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    const nested = getStringByAliases(value as Record<string, unknown>, aliases, false, minLength)
    if (nested) return nested
  }

  return null
}

function resolveValidationModeForAttempt(attempt: number): ScenarioValidationMode {
  if (attempt <= 1) return 'strict'
  if (attempt === 2) return 'relaxed'
  return 'fallback'
}

function normalizeRawScenario(item: unknown, mode: ScenarioValidationMode): RawScenario | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  const obj = item as Record<string, unknown>
  const fieldMinLength = mode === 'strict' ? 4 : mode === 'relaxed' ? 3 : 2

  const title = getStringByAliases(
    obj,
    ['title', 'titulo', 'headline', 'summary', 'tema'],
    true,
    fieldMinLength
  )
  const act = getStringByAliases(
    obj,
    ['act', 'acao', 'acaoprincipal', 'action', 'action1', 'caseact', 'fato', 'conduct'],
    true,
    fieldMinLength
  )
  const rival = getStringByAliases(
    obj,
    ['rival', 'opponent', 'opositor', 'adversario', 'rivalname', 'actora', 'critic'],
    true,
    fieldMinLength
  )
  const ally = getStringByAliases(
    obj,
    ['ally', 'allied', 'aliado', 'governista', 'allyname', 'actorb', 'defender'],
    true,
    fieldMinLength
  )
  const context = getStringByAliases(
    obj,
    ['context', 'contexto', 'descricao', 'detalhes', 'justificativa', 'background'],
    true,
    fieldMinLength
  )

  const fallbackTitle = title ?? act?.slice(0, 72) ?? context?.slice(0, 72) ?? null
  const fallbackContext = context ?? act ?? null

  if (!fallbackTitle || !act || !rival || !ally || !fallbackContext) return null
  return {
    title: fallbackTitle.trim(),
    act: act.trim(),
    rival: rival.trim(),
    ally: ally.trim(),
    context: fallbackContext.trim(),
  }
}

function simplifyPublicLanguageText(value: string, language: 'en-US' | 'pt-BR'): string {
  const cleaned = value.replace(/\s+/g, ' ').trim()

  const replacements: Array<[RegExp, string]> =
    language === 'pt-BR'
      ? [
          [/\bconforme\b/gi, 'de acordo com'],
          [/\bmediante\b/gi, 'com'],
          [/\bsupracitado\b/gi, 'citado acima'],
          [/\boutrossim\b/gi, 'alem disso'],
          [/\btodavia\b/gi, 'mas'],
          [/\bdestarte\b/gi, 'assim'],
          [/\bhodiern[oa]mente\b/gi, 'hoje'],
          [/\bviabilizar\b/gi, 'permitir'],
          [/\bmitigar\b/gi, 'reduzir'],
          [/\bimplementar\b/gi, 'colocar em pratica'],
          [/\bperpetrar\b/gi, 'cometer'],
          [/\bdeliberadamente\b/gi, 'de proposito'],
          [/\bnao obstante\b/gi, 'mesmo assim'],
          [/\bpor conseguinte\b/gi, 'por isso'],
        ]
      : [
          [/\btherefore\b/gi, 'so'],
          [/\bnotwithstanding\b/gi, 'even so'],
          [/\bfurthermore\b/gi, 'also'],
          [/\bmoreover\b/gi, 'also'],
          [/\bhence\b/gi, 'so'],
          [/\bthus\b/gi, 'so'],
          [/\bupon\b/gi, 'on'],
          [/\bendeavor\b/gi, 'try'],
          [/\butilize\b/gi, 'use'],
          [/\bmitigate\b/gi, 'reduce'],
          [/\bfacilitate\b/gi, 'help'],
          [/\bperpetrate\b/gi, 'commit'],
          [/\baforementioned\b/gi, 'mentioned above'],
          [/\binstitutional framework\b/gi, 'institution rules'],
        ]

  let simplified = cleaned
  for (const [pattern, replacement] of replacements) {
    simplified = simplified.replace(pattern, replacement)
  }

  return simplified.replace(/\s+/g, ' ').trim()
}

function simplifyPublicLanguageScenario(
  scenario: RawScenario,
  language: 'en-US' | 'pt-BR'
): RawScenario {
  return {
    ...scenario,
    title: simplifyPublicLanguageText(scenario.title, language),
    act: simplifyPublicLanguageText(scenario.act, language),
    context: simplifyPublicLanguageText(scenario.context, language),
  }
}

function validateScenarios(
  items: unknown[],
  mode: ScenarioValidationMode,
  language: 'en-US' | 'pt-BR'
): RawScenario[] {
  const valid: RawScenario[] = []
  for (const item of items) {
    const normalized = normalizeRawScenario(item, mode)
    if (!normalized) continue

    const plainLanguage = simplifyPublicLanguageScenario(normalized, language)

    const rivalNorm = normalizeKey(plainLanguage.rival)
    const allyNorm = normalizeKey(plainLanguage.ally)
    if (rivalNorm.length < 4 || allyNorm.length < 4 || rivalNorm === allyNorm) continue

    const minTitleLength = mode === 'strict' ? 14 : mode === 'relaxed' ? 8 : 4
    const minBodyLength = mode === 'strict' ? 28 : mode === 'relaxed' ? 18 : 8

    if (
      plainLanguage.title.length < minTitleLength ||
      plainLanguage.act.length < minBodyLength ||
      plainLanguage.context.length < minBodyLength
    )
      continue

    valid.push(plainLanguage)
  }
  return valid
}

function normalizeTextForChecks(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function includesAnyTerm(text: string, terms: readonly string[]): boolean {
  return terms.some((term) => text.includes(term))
}

function hasRequiredControversyShape(
  scenario: RawScenario,
  language: 'en-US' | 'pt-BR'
): boolean {
  const text = normalizeTextForChecks(`${scenario.title} ${scenario.act} ${scenario.context}`)
  const conflictTerms =
    language === 'pt-BR' ? CONTROVERSY_CONFLICT_TERMS_PT : CONTROVERSY_CONFLICT_TERMS_EN
  const institutionTerms =
    language === 'pt-BR' ? CONTROVERSY_INSTITUTION_TERMS_PT : CONTROVERSY_INSTITUTION_TERMS_EN
  const safeTerms = language === 'pt-BR' ? SAFE_CIVICS_TERMS_PT : SAFE_CIVICS_TERMS_EN

  const hasConflict = includesAnyTerm(text, conflictTerms)
  const hasInstitution = includesAnyTerm(text, institutionTerms)
  const isSafeOnly = includesAnyTerm(text, safeTerms) && !hasConflict

  return hasConflict && hasInstitution && !isSafeOnly
}

function hasRelaxedControversyShape(
  scenario: RawScenario,
  language: 'en-US' | 'pt-BR'
): boolean {
  const text = normalizeTextForChecks(`${scenario.title} ${scenario.act} ${scenario.context}`)
  const conflictTerms =
    language === 'pt-BR' ? CONTROVERSY_CONFLICT_TERMS_PT : CONTROVERSY_CONFLICT_TERMS_EN
  const institutionTerms =
    language === 'pt-BR' ? CONTROVERSY_INSTITUTION_TERMS_PT : CONTROVERSY_INSTITUTION_TERMS_EN
  const safeTerms = language === 'pt-BR' ? SAFE_CIVICS_TERMS_PT : SAFE_CIVICS_TERMS_EN

  const hasConflict = includesAnyTerm(text, conflictTerms)
  const hasInstitution = includesAnyTerm(text, institutionTerms)
  const isSafeOnly = includesAnyTerm(text, safeTerms) && !hasConflict

  return !isSafeOnly && (hasConflict || hasInstitution)
}

function selectAcceptedScenarios(
  scenarios: RawScenario[],
  language: 'en-US' | 'pt-BR',
  attempt: number,
  maxAttempts: number
): { accepted: RawScenario[]; mode: ControversyAcceptanceMode } {
  if (attempt <= 1) {
    return {
      accepted: scenarios.filter((scenario) => hasRequiredControversyShape(scenario, language)),
      mode: 'strict',
    }
  }

  if (attempt < maxAttempts) {
    return {
      accepted: scenarios.filter((scenario) => hasRelaxedControversyShape(scenario, language)),
      mode: 'relaxed',
    }
  }

  return {
    accepted: scenarios,
    mode: 'fallback',
  }
}

function resolveAcceptanceModeForAttempt(attempt: number): ControversyAcceptanceMode {
  if (attempt <= 1) return 'strict'
  if (attempt === 2) return 'relaxed'
  return 'fallback'
}

function resolveTopicQuotas(expectedCount: number): TopicQuota[] {
  if (expectedCount <= 6) return []
  return [
    { topic: 'religion', minimum: 2 },
    { topic: 'abortion', minimum: 2 },
  ]
}

function getTopicTerms(language: 'en-US' | 'pt-BR', topic: ScenarioTopic): readonly string[] {
  if (topic === 'religion') {
    return language === 'pt-BR' ? RELIGION_TERMS_PT : RELIGION_TERMS_EN
  }
  return language === 'pt-BR' ? ABORTION_TERMS_PT : ABORTION_TERMS_EN
}

function scenarioMatchesTopic(
  scenario: RawScenario,
  language: 'en-US' | 'pt-BR',
  topic: ScenarioTopic
): boolean {
  const text = normalizeTextForChecks(`${scenario.title} ${scenario.act} ${scenario.context}`)
  return includesAnyTerm(text, getTopicTerms(language, topic))
}

function countTopicMatches(
  scenarios: RawScenario[],
  language: 'en-US' | 'pt-BR',
  topic: ScenarioTopic
): number {
  return scenarios.filter((scenario) => scenarioMatchesTopic(scenario, language, topic)).length
}

function resolveMissingTopicQuotas(
  scenarios: RawScenario[],
  language: 'en-US' | 'pt-BR',
  quotas: TopicQuota[]
): TopicQuota[] {
  return quotas
    .map((quota) => {
      const current = countTopicMatches(scenarios, language, quota.topic)
      return { topic: quota.topic, minimum: Math.max(0, quota.minimum - current) }
    })
    .filter((quota) => quota.minimum > 0)
}

function hasAllTopicQuotas(
  scenarios: RawScenario[],
  language: 'en-US' | 'pt-BR',
  quotas: TopicQuota[]
): boolean {
  return resolveMissingTopicQuotas(scenarios, language, quotas).length === 0
}

function selectFinalScenariosWithQuotas(config: {
  scenarios: RawScenario[]
  generationCount: number
  language: 'en-US' | 'pt-BR'
  quotas: TopicQuota[]
}): RawScenario[] | null {
  const { scenarios, generationCount, language, quotas } = config
  if (scenarios.length < generationCount) return null
  if (quotas.length === 0) return scenarios.slice(0, generationCount)

  const selected: RawScenario[] = []
  const used = new Set<string>()

  for (const quota of quotas) {
    const alreadySelectedForTopic = countTopicMatches(selected, language, quota.topic)
    const needed = Math.max(0, quota.minimum - alreadySelectedForTopic)
    if (needed === 0) continue

    for (const scenario of scenarios) {
      if (selected.length >= generationCount) break
      const signature = scenarioSignature(scenario)
      if (used.has(signature)) continue
      if (!scenarioMatchesTopic(scenario, language, quota.topic)) continue
      selected.push(scenario)
      used.add(signature)
      const updatedCount = countTopicMatches(selected, language, quota.topic)
      if (updatedCount >= quota.minimum) break
    }
  }

  for (const scenario of scenarios) {
    if (selected.length >= generationCount) break
    const signature = scenarioSignature(scenario)
    if (used.has(signature)) continue
    selected.push(scenario)
    used.add(signature)
  }

  if (selected.length < generationCount) return null
  if (!hasAllTopicQuotas(selected, language, quotas)) return null
  return selected
}

function tAcceptanceMode(language: 'en-US' | 'pt-BR', mode: ControversyAcceptanceMode): string {
  return tStatus(language, `aiStatus.acceptanceModes.${mode}`)
}

function scoreScenarioSetForControversy(
  scenarios: RawScenario[],
  language: 'en-US' | 'pt-BR',
  expectedCount: number
): number {
  if (scenarios.length === 0) return 0
  const matches = scenarios.filter((scenario) => hasRequiredControversyShape(scenario, language)).length
  const denominator = Math.max(1, expectedCount)
  return Math.round((matches / denominator) * 100)
}

function scenarioSignature(scenario: RawScenario): string {
  return [scenario.title, scenario.act, scenario.rival, scenario.ally, scenario.context]
    .map((value) => normalizeTextForChecks(value).replace(/\s+/g, ' ').trim())
    .join('|')
}

function mergeUniqueScenarios(current: RawScenario[], incoming: RawScenario[]): RawScenario[] {
  const seen = new Set(current.map(scenarioSignature))
  const merged = [...current]

  for (const scenario of incoming) {
    const signature = scenarioSignature(scenario)
    if (seen.has(signature)) continue
    seen.add(signature)
    merged.push(scenario)
  }

  return merged
}

function resolveRunpodBatchSize(totalCount: number): number {
  // Generate all requested scenarios in a single LLM request to avoid the high connection & generation overhead of multiple sequential sequential requests.
  return totalCount
}

function parseTimeoutMs(raw: unknown): number {
  if (typeof raw !== 'string' || raw.trim().length === 0) return DEFAULT_RUNPOD_TIMEOUT_MS
  const parsed = Number.parseInt(raw, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_RUNPOD_TIMEOUT_MS
}

function runpodBasePath(): string {
  const fromEnv = (import.meta.env['VITE_RUNPOD_BASE_PATH'] as string | undefined)?.trim()
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_RUNPOD_BASE_PATH
}

function runpodTimeoutMs(): number {
  return parseTimeoutMs(import.meta.env['VITE_RUNPOD_TIMEOUT_MS'])
}

function resolveRunpodModelName(modelId: ModelPresetId): string {
  const overrideKeys: Record<ModelPresetId, string> = {
    qwen257b: 'VITE_RUNPOD_MODEL_QWEN257B',
  }
  const primaryOverride = (import.meta.env[overrideKeys[modelId]] as string | undefined)?.trim()
  if (primaryOverride && primaryOverride.length > 0) return primaryOverride

  // Backward compatibility with existing env setup.
  const legacyQwenOverride = (import.meta.env['VITE_RUNPOD_MODEL_QWEN25'] as string | undefined)?.trim()
  if (legacyQwenOverride && legacyQwenOverride.length > 0) return legacyQwenOverride

  return MODEL_PRESETS[modelId]
}

function joinRunpodPath(path: string): string {
  const base = runpodBasePath().replace(/\/+$/, '')
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${base}${suffix}`
}

function composeAbortSignal(signal?: AbortSignal, timeoutMs = runpodTimeoutMs()) {
  const controller = new AbortController()
  const timeoutId = globalThis.setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })

  return {
    signal: controller.signal,
    cleanup: () => {
      globalThis.clearTimeout(timeoutId)
      signal?.removeEventListener('abort', onAbort)
    },
  }
}

async function fetchRunpodJson<T>(config: {
  path: string
  method?: 'GET' | 'POST'
  body?: unknown
  signal?: AbortSignal
}): Promise<T> {
  const composed = composeAbortSignal(config.signal)
  const method = config.method ?? 'GET'
  const hasBody = config.body !== undefined

  try {
    const response = await fetch(joinRunpodPath(config.path), {
      method,
      // Keep GET requests as simple CORS requests (no custom headers) to avoid preflight failures.
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(config.body) : undefined,
      signal: composed.signal,
    })

    if (!response.ok) {
      throw new Error(`runpod-http-${response.status}`)
    }

    return (await response.json()) as T
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      if (!config.signal || !config.signal.aborted) {
        throw new Error('runpod-timeout', { cause: err })
      }
    }
    throw err
  } finally {
    composed.cleanup()
  }
}

export async function listRunpodModels(signal?: AbortSignal): Promise<string[]> {
  const payload = await fetchRunpodJson<LocalAIModelListResponse>({
    path: '/models',
    method: 'GET',
    signal,
  })

  return (payload.data ?? [])
    .map((entry) => entry.id?.trim() ?? '')
    .filter((entry): entry is string => entry.length > 0)
}

export async function getCachedRunpodModels(signal?: AbortSignal): Promise<string[]> {
  if (!runpodModelsCache) {
    runpodModelsCache = listRunpodModels(signal).catch((error) => {
      runpodModelsCache = null
      throw error
    })
  }
  return runpodModelsCache
}

function pickAvailableModel(requestedModel: string, availableModels: string[]): string {
  if (availableModels.includes(requestedModel)) {
    return requestedModel
  }
  return availableModels[0] ?? requestedModel
}

function describePrincipleForPrompt(principleId: string, language: 'en-US' | 'pt-BR'): string {
  const isPt = language === 'pt-BR'
  const normalized = normalizeKey(principleId)

  if (normalized === 'transparency') {
    return isPt ? 'transparencia institucional e acesso publico a informacao' : 'institutional transparency and public access to information'
  }
  if (normalized === 'accountability') {
    return isPt ? 'responsabilizacao por abuso, mentira e violacao de dever publico' : 'accountability for abuse, deception, and breach of public duty'
  }
  if (normalized === 'equality') {
    return isPt ? 'igualdade de tratamento entre grupos opostos' : 'equal standards across opposing groups'
  }
  if (normalized === 'religiousfreedom') {
    return isPt ? 'liberdade religiosa, conflito entre liberdade de culto e regras civicas' : 'religious freedom, conflict between faith expression and civic rules'
  }
  if (normalized === 'reproductiveautonomy') {
    return isPt ? 'autonomia reprodutiva, conflito sobre aborto e politica publica de saude' : 'reproductive autonomy, abortion conflict and public health policy'
  }

  return principleId
}

function buildPrincipleListForPrompt(
  principleIds: string[],
  language: 'en-US' | 'pt-BR'
): string {
  const labels = principleIds.map((principleId) => describePrincipleForPrompt(principleId, language))
  return labels.join(', ')
}

function buildRunpodScenarioMessages(config: {
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleIds: string[]
  count: number
  attempt: number
  missingQuotas?: TopicQuota[]
}): Array<{ role: 'system' | 'user'; content: string }> {
  const isPt = config.language === 'pt-BR'
  const principleList = buildPrincipleListForPrompt(config.principleIds, config.language)
  const missingReligion = config.missingQuotas?.find((quota) => quota.topic === 'religion')?.minimum ?? 0
  const missingAbortion = config.missingQuotas?.find((quota) => quota.topic === 'abortion')?.minimum ?? 0
  const hasTopicTargets = missingReligion > 0 || missingAbortion > 0
  const escalation =
    config.attempt > 1
      ? isPt
        ? ' PRIORIDADE MAXIMA: descarte qualquer ideia neutra ou consensual. So aceite casos que gerem conflito moral real e divisao plausivel.'
        : ' MAXIMUM PRIORITY: reject neutral or consensus-friendly ideas. Keep only cases with real moral conflict and plausible social split.'
      : ''
  const topicConstraint = hasTopicTargets
    ? isPt
      ? ` COTA OBRIGATORIA NESTA RESPOSTA: inclua pelo menos ${missingReligion} caso(s) sobre religiao e ${missingAbortion} caso(s) sobre aborto (podem coexistir no mesmo caso, mas os dois temas devem aparecer explicitamente em title/act/context).`
      : ` MANDATORY QUOTA FOR THIS RESPONSE: include at least ${missingReligion} religion case(s) and ${missingAbortion} abortion case(s) (they may overlap, but both themes must be explicit in title/act/context).`
    : ''
  const languageConstraint = isPt
    ? ' LINGUAGEM OBRIGATORIA: escreva de forma simples, direta e popular. Evite juridiquês, termos tecnicos, formalismo excessivo e frases longas. Use vocabulario que qualquer pessoa adulta compreenda na primeira leitura.'
    : ' LANGUAGE REQUIREMENT: write in simple, direct, plain language. Avoid legal jargon, technical/formal wording, and long complex sentences. Use vocabulary that most adults can understand on first read.'

  const system = isPt
    ? `Voce e um arquiteto de testes de coerencia moral. Gere dilemas espelhados de alta friccao social em JSON estrito. Proibido produzir conteudo pedagogico neutro, campanhas civicas consensuais ou exemplos universalmente aceitaveis.${languageConstraint} Responda APENAS com um array JSON valido, sem markdown, sem texto extra e sem comentarios.`
    : `You are a moral-consistency stress-test architect. Generate high-friction mirrored dilemmas in strict JSON. Do NOT output neutral educational civic content, consensus campaigns, or universally acceptable examples.${languageConstraint} Reply ONLY with a valid JSON array, no markdown, no extra prose, and no comments.`

  const user = isPt
    ? `Gere ${config.count} objetos JSON para ${config.countryCode}. Use estes principios em rotacao: ${principleList}. Cada objeto deve ter as chaves EXATAS: title, act, rival, ally, context. Regras obrigatorias: (1) o act deve descrever uma conduta controversa (abuso de poder, censura, favorecimento, corrupcao, discriminacao, vigilancia, conflito de interesse ou equivalente); (2) rival e ally devem ser atores nitidamente diferentes e politicamente/socialmente opostos no contexto local; (3) context deve citar instituicao realista (governo, empresa, escola, plataforma, sistema de justica etc.) e o custo social da decisao; (4) evite qualquer ato genericamente virtuoso ou consensual; (5) use linguagem simples e popular, com frases curtas e sem jargao tecnico.${topicConstraint} Escreva em portugues brasileiro.${escalation}`
    : `Generate ${config.count} JSON objects for ${config.countryCode}. Rotate these principles: ${principleList}. Every object must use EXACT keys: title, act, rival, ally, context. Required rules: (1) act must describe a controversial conduct (power abuse, censorship, favoritism, corruption, discrimination, surveillance, conflict of interest, or equivalent); (2) rival and ally must be clearly different actors with opposing social/political alignment in local context; (3) context must include a realistic institution (government, company, school, platform, justice system, etc.) and societal tradeoff; (4) avoid any universally virtuous or consensus-safe act; (5) use plain language with short sentences and no technical jargon.${topicConstraint}${escalation}`

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}

export async function generateAIScenariosWithRunpod(
  config: AIScenarioGeneratorConfig
): Promise<ScenarioPreset[]> {
  const { countryCode, language, principleIds, count, signal, onProgress } = config
  const activePrincipleIds = principleIds.length > 0 ? principleIds : ['equality']
  const selectedModelId = resolveSafeModelId(config.model)
  const requestedModel = resolveRunpodModelName(selectedModelId)
  const generationCount = resolveSafeScenarioCount(count)
  const topicQuotas = resolveTopicQuotas(generationCount)
  const batchSize = resolveRunpodBatchSize(generationCount)
  const maxAttempts = Math.max(
    RUNPOD_MAX_GENERATION_ATTEMPTS + 2,
    Math.ceil(generationCount / Math.max(1, batchSize)) + 8
  )

  onProgress?.({
    phase: 'compiling',
    percent: 10,
    label: tStatus(language, 'aiStatus.startGenerate'),
    uiStage: 'preparing',
    itemsCompleted: 0,
    itemsTotal: generationCount,
  })

  const availableModels = await getCachedRunpodModels(signal)
  const model = pickAvailableModel(requestedModel, availableModels)

  onProgress?.({
    phase: 'generating',
    percent: 35,
    label: tStatus(language, 'aiStatus.synthesizingScenarios', { count: generationCount }),
    uiStage: 'drafting',
    itemsCompleted: 0,
    itemsTotal: generationCount,
  })

  let parsed: RawScenario[] = []
  let lastContentPreview = ''

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const remainingCount = generationCount - parsed.length
    const missingQuotas = resolveMissingTopicQuotas(parsed, language, topicQuotas)
    if (remainingCount <= 0 && missingQuotas.length === 0) break

    if (attempt > 1) {
      onProgress?.({
        phase: 'generating',
        percent: 35,
        label: tStatus(language, 'aiStatus.retryingScenario', {
          current: attempt,
          total: maxAttempts,
          mode: tAcceptanceMode(language, resolveAcceptanceModeForAttempt(attempt)),
        }),
        uiStage: 'refining',
        itemsCompleted: parsed.length,
        itemsTotal: generationCount,
      })
    }

    const requestedCountForAttempt =
      remainingCount > 0
        ? Math.min(batchSize, remainingCount)
        : Math.max(2, Math.min(batchSize, missingQuotas.reduce((sum, quota) => sum + quota.minimum, 0)))

    const response = await fetchRunpodJson<LocalAIChatCompletionsResponse>({
      path: '/chat/completions',
      method: 'POST',
      body: {
        model,
        temperature: attempt === 1 ? 0.9 : 1.05,
        top_p: attempt === 1 ? 0.92 : 0.98,
        frequency_penalty: 0.25,
        presence_penalty: 0.45,
        stream: false,
        response_format: { type: 'json_object' },
        keep_alive: '1h',
        max_tokens: 3000,
        messages: buildRunpodScenarioMessages({
          countryCode,
          language,
          principleIds: activePrincipleIds,
          count: requestedCountForAttempt,
          attempt,
          missingQuotas,
        }),
      },
      signal,
    })

    const content = response.choices?.[0]?.message?.content ?? ''
    lastContentPreview = content.slice(0, 220)
    if (!content || content.trim().length === 0) {
      debugLog('runpod empty response on attempt', { attempt, model, countryCode })
      continue
    }

    const extracted = extractJsonArray(content)
    const validationMode = resolveValidationModeForAttempt(attempt)
    const candidate = extracted ? validateScenarios(extracted, validationMode, language) : []
    const acceptance = selectAcceptedScenarios(candidate, language, attempt, maxAttempts)
    const controversyScore = scoreScenarioSetForControversy(
      acceptance.accepted,
      language,
      requestedCountForAttempt
    )
    const merged = mergeUniqueScenarios(parsed, acceptance.accepted)

    debugLog('runpod generation quality', {
      attempt,
      validationMode,
      parsedCount: candidate.length,
      acceptedCount: acceptance.accepted.length,
      acceptanceMode: acceptance.mode,
      accumulatedCount: merged.length,
      controversyScore,
      expectedCount: requestedCountForAttempt,
    })

    if (merged.length > parsed.length) {
      parsed = merged
    }
  }

  if (parsed.length === 0) {
    debugLog('runpod invalid/low-controversy response', {
      contentPreview: lastContentPreview,
      model,
      countryCode,
      count: generationCount,
      batchSize,
      maxAttempts,
    })
    throw new Error('runpod-invalid-json-response')
  }

  const finalRawScenarios = selectFinalScenariosWithQuotas({
    scenarios: parsed,
    generationCount,
    language,
    quotas: topicQuotas,
  })

  if (!finalRawScenarios) {
    debugLog('runpod missing required topic quotas', {
      model,
      countryCode,
      generationCount,
      quotas: topicQuotas,
      missing: resolveMissingTopicQuotas(parsed, language, topicQuotas),
      parsedCount: parsed.length,
    })
    throw new Error('runpod-missing-required-topics')
  }

  onProgress?.({
    phase: 'generating',
    percent: 80,
    label: tStatus(language, 'aiStatus.generatedScenarios', {
      got: Math.min(generationCount, parsed.length),
      total: generationCount,
    }),
    uiStage: 'finalizing',
    itemsCompleted: Math.min(generationCount, parsed.length),
    itemsTotal: generationCount,
  })

  const isPt = language === 'pt-BR'
  const now = Date.now()
  const scenarios: ScenarioPreset[] = finalRawScenarios.map((scenario, index) => {
    const principleId = activePrincipleIds[index % activePrincipleIds.length]
    return {
      id: `ai-local-${now}-${index}`,
      principleId,
      title: scenario.title,
      category: `AI-${countryCode}/${principleId.toUpperCase()}`,
      exceptionCode: `CL_SEM_AI_${100 + Math.floor(Math.random() * 900)}_${index}`,
      exceptionType: 'ShiftingLogicException',
      caseStudyA: {
        type: 'RIVAL',
        subject: scenario.rival,
        act: scenario.act,
        context: scenario.context,
        expectedReaction: isPt
          ? 'Clamor de indignacao publica imediato'
          : 'Absolute online outrage and public cancelations',
        justificationLogic: isPt
          ? 'Uso indevido inaceitavel de prerrogativas do cargo'
          : 'Gross and unacceptable breach of ethical parameters',
      },
      caseStudyB: {
        type: 'ALLY',
        subject: scenario.ally,
        act: scenario.act,
        context: scenario.context,
        expectedReaction: isPt
          ? 'Compreensao ou justificativa matizada'
          : 'Nuanced defense of societal purpose alignment',
        justificationLogic: isPt
          ? 'A causa nobre atenua qualquer transgressao'
          : 'The progressive target metrics justify situational flexibilities',
      },
    }
  })

  onProgress?.({
    phase: 'done',
    percent: 100,
    label: tStatus(language, 'aiStatus.generatedSummary', {
      got: scenarios.length,
      total: generationCount,
    }),
    uiStage: 'done',
    itemsCompleted: scenarios.length,
    itemsTotal: generationCount,
  })

  return scenarios
}
