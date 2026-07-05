import { type ScenarioPreset } from '../types/linter'

export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brazil / Brasil' },
  { code: 'US', name: 'United States / EUA' },
  { code: 'FR', name: 'France / França' },
  { code: 'UK', name: 'United Kingdom / Reino Unido' },
  { code: 'JP', name: 'Japan / Japão' },
]

export const MODEL_PRESETS = {
  smollm135: 'HuggingFaceTB/SmolLM2-135M-Instruct',
  smollm2: 'HuggingFaceTB/SmolLM2-360M-Instruct',
  qwen25: 'onnx-community/Qwen2.5-0.5B-Instruct',
} as const

export type ModelPresetId = keyof typeof MODEL_PRESETS

export type Backend = 'webgpu' | 'wasm'
export type GenerationPhase = 'idle' | 'downloading' | 'compiling' | 'generating' | 'done'
export type GenerationUiStage = 'preparing' | 'drafting' | 'refining' | 'finalizing' | 'done'

export interface GenerationProgress {
  phase: GenerationPhase
  percent: number
  label: string
  uiStage?: GenerationUiStage
  itemsCompleted?: number
  itemsTotal?: number
}

const FAST_MODE = true
const HEALTHCHECK_MAX_NEW_TOKENS = FAST_MODE ? 12 : 24
const GENERATION_MAX_NEW_TOKENS = FAST_MODE ? 224 : 384
const GENERATION_TEMPERATURES = FAST_MODE ? [0.7] : [0.7, 0.6, 0.5]
const ENABLE_FALLBACK_ON_EMPTY = !FAST_MODE
const FAST_MODE_REFILL_MAX_ATTEMPTS = 2

interface RuntimeSelection {
  device: Backend
  dtype: string
  handle: PipelineHandle
}

const AI_DEBUG_PREFIX = '[ai-debug][generator]'
function debugLog(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    // eslint-disable-next-line no-console
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  // eslint-disable-next-line no-console
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
}

function toRangePercent(percent: number, start: number, end: number): number {
  const bounded = Math.max(0, Math.min(100, percent))
  return Math.round(start + (bounded / 100) * (end - start))
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

/**
 * WebGPU availability check. Cheap enough to call on demand; the browser caches
 * adapter requests internally. Dtype is chosen per-model because some
 * quantizations (notably Qwen2.5-0.5B in q4f16) collapse into token salad on
 * several WebGPU adapters.
 */
export async function detectBackend(
  modelId?: ModelPresetId
): Promise<{ device: Backend; dtype: string }> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter: () => Promise<unknown> } }).gpu
  if (gpu) {
    try {
      const adapter = await gpu.requestAdapter()
      if (adapter) {
        // Prefer q4 for known fragile combinations to reduce warmup failures
        // that otherwise force a second full pipeline load.
        const dtype = modelId === 'smollm2' || modelId === 'qwen25' ? 'q4' : 'q4f16'
        debugLog('detectBackend -> webgpu selected', { modelId, dtype })
        return { device: 'webgpu', dtype }
      }
    } catch {
      // fall through
    }
  }
  debugLog('detectBackend -> wasm selected', { modelId, dtype: 'q4' })
  return { device: 'wasm', dtype: 'q4' }
}

export function suggestDefaultModelId(): ModelPresetId {
  const userAgent = navigator.userAgent
  const isMobile = /Android|iPhone|iPad|iPod/i.test(userAgent)
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4

  if (isMobile || mem <= 4 || cores <= 4) return 'smollm135'
  if (mem <= 8 || cores <= 8) return 'smollm2'
  // Keep desktop default stable and allow explicit opt-in to heavier models.
  return 'smollm2'
}

// Module-level pipeline cache: keyed by `${model}|${device}|${dtype}` so a
// second generation with the same options skips download + compile entirely.
type PipelineHandle = ((
  messages: unknown,
  options: Record<string, unknown>
) => Promise<Array<{ generated_text?: unknown }>>) & {
  tokenizer: unknown
}
const pipelineCache = new Map<string, Promise<PipelineHandle>>()
const runtimeHealthCache = new Map<string, Promise<RuntimeSelection>>()

/**
 * Load (or return cached) text-generation pipeline. Streams download +
 * compile progress via `onProgress`.
 */
export async function ensurePipeline(config: {
  model: string
  device: Backend
  dtype: string
  onProgress?: (progress: GenerationProgress) => void
}): Promise<PipelineHandle> {
  const key = `${config.model}|${config.device}|${config.dtype}`
  const existing = pipelineCache.get(key)
  if (existing) {
    debugLog('ensurePipeline cache hit', { key })
    config.onProgress?.({
      phase: 'compiling',
      percent: 36,
      label: 'Pipeline cache HIT',
      uiStage: 'preparing',
    })
    return existing
  }

  const load = (async () => {
    debugLog('ensurePipeline load start', {
      model: config.model,
      device: config.device,
      dtype: config.dtype,
    })
    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowLocalModels = false

    config.onProgress?.({
      phase: 'downloading',
      percent: 4,
      label: `Loading ${config.model} on ${config.device.toUpperCase()} (${config.dtype})...`,
      uiStage: 'preparing',
    })

    // Track download progress across files as a single aggregated percentage.
    const fileBytes = new Map<string, { loaded: number; total: number }>()

    const handle = (await pipeline('text-generation', config.model, {
      device: config.device,
      dtype: config.dtype as
        | 'auto'
        | 'q4f16'
        | 'q4'
        | 'fp32'
        | 'fp16'
        | 'q8'
        | 'int8'
        | 'uint8'
        | 'bnb4'
        | 'q2'
        | 'q2f16'
        | 'q1'
        | 'q1f16',
      progress_callback: (data: unknown) => {
        const info = data as {
          status: string
          progress?: number
          file?: string
          loaded?: number
          total?: number
        }
        if (info.status === 'progress' && info.file) {
          fileBytes.set(info.file, {
            loaded: info.loaded ?? 0,
            total: info.total ?? 0,
          })
          let totalLoaded = 0
          let totalSize = 0
          for (const entry of fileBytes.values()) {
            totalLoaded += entry.loaded
            totalSize += entry.total
          }
          const pct = totalSize > 0 ? Math.min(95, Math.round((totalLoaded / totalSize) * 95)) : 5
          config.onProgress?.({
            phase: 'downloading',
            percent: toRangePercent(pct, 6, 30),
            label: `Downloading weights [${info.file.slice(-28)}] ${pct}%`,
            uiStage: 'preparing',
          })
        } else if (info.status === 'ready' || info.status === 'done') {
          config.onProgress?.({
            phase: 'compiling',
            percent: 34,
            label: 'Compiling ONNX graph / warming kernels...',
            uiStage: 'preparing',
          })
        }
      },
    })) as unknown as PipelineHandle

    config.onProgress?.({
      phase: 'compiling',
      percent: 38,
      label: 'Pipeline ready.',
      uiStage: 'preparing',
    })
    debugLog('ensurePipeline ready', { key })
    return handle
  })()

  pipelineCache.set(key, load)
  try {
    return await load
  } catch (err) {
    pipelineCache.delete(key)
    debugLog('ensurePipeline failed', {
      key,
      message: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

interface RawScenario {
  title: string
  act: string
  rival: string
  ally: string
  context: string
}

type PartialRawScenario = Partial<RawScenario>

class DegenerateGenerationError extends Error {
  constructor() {
    super('degenerate-generation')
  }
}

class RuntimeHealthCheckError extends Error {
  selection: RuntimeSelection

  constructor(selection: RuntimeSelection) {
    super(`runtime-healthcheck-failed:${selection.device}:${selection.dtype}`)
    this.selection = selection
  }
}

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 3

function stripFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers the model likes to add.
  return text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
}

function repairMalformedJson(text: string): string {
  let repaired = text
  // Common corruption: missing closing quote before the next key.
  // Example: ...education for all,"rival":...  -> ...education for all","rival":...
  repaired = repaired.replace(
    /([A-Za-z0-9).!?])\s*,\s*"(title|act|rival|ally|context)"\s*:/g,
    '$1","$2":'
  )
  // Handle unescaped quotes that appear before a known key transition.
  repaired = repaired.replace(/"\s*,\s*"(title|act|rival|ally|context)"\s*:/g, '","$1":')
  return repaired
}

function tryParse(slice: string): unknown[] | null {
  const attempts = [
    slice,
    // Strip trailing commas before `]` or `}`.
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
      // try next
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
        try {
          const parsedInner = JSON.parse(repairMalformedJson(inner))
          if (Array.isArray(parsedInner)) return parsedInner
          if (parsedInner && typeof parsedInner === 'object') return [parsedInner]
        } catch {
          // fall through
        }
      }
    } catch {
      // fall through
    }
  }
  return null
}

function extractJsonArray(rawText: string): unknown[] | null {
  const text = stripFences(rawText)
  const direct = parseDirectJson(text)
  if (direct) return direct
  // Find the first `[` and its matching closing `]`, tolerating trailing model chatter.
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
    if (ch === '[') depth++
    else if (ch === ']') {
      depth--
      if (depth === 0) {
        const parsed = tryParse(text.slice(start, i + 1))
        if (parsed) return parsed
        break
      }
    }
  }
  // Fallback: scan for standalone `{ ... }` objects.
  return extractObjects(text)
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
      depth++
    } else if (ch === '}') {
      depth--
      if (depth === 0 && start >= 0) {
        const slice = text.slice(start, i + 1)
        const attempts = [slice, slice.replace(/,\s*(\]|\})/g, '$1')]
        for (const attempt of attempts) {
          try {
            results.push(JSON.parse(attempt))
            break
          } catch {
            // try next
          }
        }
        start = -1
      }
    }
  }
  return results.length > 0 ? results : null
}

function normalizeKey(rawKey: string): string {
  return rawKey
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function getStringByAliases(
  obj: Record<string, unknown>,
  aliases: string[],
  deepSearch = false
): string | null {
  const aliasSet = new Set(aliases)
  for (const [key, value] of Object.entries(obj)) {
    if (!aliasSet.has(normalizeKey(key))) continue
    if (isNonEmptyString(value)) return value.trim()
  }

  if (!deepSearch) return null

  for (const value of Object.values(obj)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue
    const nested = getStringByAliases(value as Record<string, unknown>, aliases, false)
    if (nested) return nested
  }

  return null
}

function normalizeRawScenario(item: unknown): RawScenario | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null
  const obj = item as Record<string, unknown>

  const title = getStringByAliases(obj, ['title', 'titulo'], true)
  const act = getStringByAliases(
    obj,
    ['act', 'acao', 'acaoprincipal', 'action', 'action1', 'caseact', 'fato'],
    true
  )
  const rival = getStringByAliases(
    obj,
    ['rival', 'opponent', 'opositor', 'adversario', 'rivalname'],
    true
  )
  const ally = getStringByAliases(
    obj,
    ['ally', 'allied', 'aliado', 'governista', 'allyname'],
    true
  )
  const context = getStringByAliases(
    obj,
    ['context', 'contexto', 'descricao', 'detalhes', 'justificativa'],
    true
  )

  if (!title || !act || !rival || !ally || !context) return null
  return { title, act, rival, ally, context }
}

function cleanLooseValue(raw: string): string {
  return raw
    .replace(/^\s*[:=-]?\s*/, '')
    .replace(/[\]"}]+\s*$/g, '')
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractLooseField(text: string, aliases: string[]): string | undefined {
  for (const alias of aliases) {
    const normalizedAlias = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const quoted = new RegExp(`"${normalizedAlias}"\\s*:\\s*"([^"\\n]{4,220})"`, 'i')
    const quotedMatch = text.match(quoted)
    if (quotedMatch?.[1]) {
      return cleanLooseValue(quotedMatch[1])
    }

    const unquoted = new RegExp(`${normalizedAlias}\\s*[:=-]\\s*([^,\\n\\r]{4,220})`, 'i')
    const unquotedMatch = text.match(unquoted)
    if (unquotedMatch?.[1]) {
      return cleanLooseValue(unquotedMatch[1])
    }
  }
  return undefined
}

function extractLooseScenario(text: string): PartialRawScenario {
  return {
    title: extractLooseField(text, ['title', 'titulo']),
    act: extractLooseField(text, ['act', 'acao', 'action', 'action1', 'fato']),
    rival: extractLooseField(text, ['rival', 'opponent', 'adversario', 'opositor']),
    ally: extractLooseField(text, ['ally', 'aliado', 'allied', 'governista']),
    context: extractLooseField(text, ['context', 'contexto', 'descricao', 'detalhes']),
  }
}

function materializeLooseScenario(config: {
  partial: PartialRawScenario
  language: 'en-US' | 'pt-BR'
  countryCode: string
  principleId: string
}): RawScenario | null {
  const isPt = config.language === 'pt-BR'
  const hasUsefulSignal =
    isNonEmptyString(config.partial.title) ||
    isNonEmptyString(config.partial.act) ||
    isNonEmptyString(config.partial.context)

  if (!hasUsefulSignal) return null

  const fallbackTitle = isPt
    ? `Caso ${config.principleId} em ${config.countryCode}`
    : `${config.principleId} case in ${config.countryCode}`
  const fallbackAct = isPt
    ? 'Uso de recursos públicos para benefício privado.'
    : 'Use of public resources for private benefit.'
  const fallbackRival = isPt
    ? 'Uma figura conservadora de oposição impopular'
    : 'An unpopular conservative opposition figure'
  const fallbackAlly = isPt
    ? 'Uma figura progressista alinhada ao governo'
    : 'A progressive figure aligned with the government'
  const fallbackContext = isPt
    ? `O caso ganhou repercussão nacional em ${config.countryCode}.`
    : `The case gained nationwide attention in ${config.countryCode}.`

  return {
    title: config.partial.title?.trim() || fallbackTitle,
    act: config.partial.act?.trim() || fallbackAct,
    rival: config.partial.rival?.trim() || fallbackRival,
    ally: config.partial.ally?.trim() || fallbackAlly,
    context: config.partial.context?.trim() || fallbackContext,
  }
}

function validateScenarios(items: unknown[]): RawScenario[] {
  const valid: RawScenario[] = []
  for (const item of items) {
    const normalized = normalizeRawScenario(item)
    if (normalized) valid.push(normalized)
  }
  return valid
}

function isDegenerateOutput(text: string): boolean {
  const normalized = text.replace(/\s+/g, '')
  if (normalized.length < 32) return false

  const uniqueChars = new Set(normalized)
  if (uniqueChars.size <= 2) return true

  const firstChar = normalized[0]
  let repeatedPrefix = 0
  for (const char of normalized) {
    if (char !== firstChar) break
    repeatedPrefix += 1
  }

  return repeatedPrefix / normalized.length >= 0.8
}

function getRuntimeCandidates(preferred: { device: Backend; dtype: string }) {
  const candidates = [{ device: preferred.device, dtype: preferred.dtype }]
  if (preferred.device !== 'wasm') {
    candidates.push({ device: 'wasm' as const, dtype: 'q4' })
  }
  return candidates
}

function getRuntimeCacheKey(model: string, device: Backend, dtype: string) {
  return `${model}|${device}|${dtype}`
}

function buildHealthMessages(language: 'en-US' | 'pt-BR') {
  const isPt = language === 'pt-BR'
  return isPt
    ? 'Responda apenas com {"ok":"sim"}. Sem markdown, sem comentários.'
    : 'Reply only with {"ok":"yes"}. No markdown. No comments.'
}

async function runHealthCheck(config: {
  handle: PipelineHandle
  language: 'en-US' | 'pt-BR'
  signal?: AbortSignal
}): Promise<boolean> {
  const prompt = buildHealthMessages(config.language)
  const output = await config.handle(prompt, {
    max_new_tokens: HEALTHCHECK_MAX_NEW_TOKENS,
    do_sample: false,
    top_p: 1,
    repetition_penalty: 1,
    return_full_text: false,
  })

  if (config.signal?.aborted) {
    throw new Error('aborted')
  }

  const generated = output[0]?.generated_text
  let text = ''
  if (typeof generated === 'string') {
    text = generated
  } else if (Array.isArray(generated)) {
    const last = generated[generated.length - 1] as { content?: string } | undefined
    text = last?.content ?? ''
  }

  if (!text || isDegenerateOutput(text)) {
    debugLog('runHealthCheck failed: empty or degenerate output')
    return false
  }

  const normalized = stripFences(text).trim()
  try {
    const parsed = JSON.parse(normalized) as { ok?: string }
    const okValue = parsed.ok?.toLowerCase()
    const ok = okValue === 'yes' || okValue === 'sim'
    debugLog('runHealthCheck parsed JSON', { ok, okValue })
    return ok
  } catch {
    // Some runtimes return plain text instead of strict JSON during tiny probes.
    // Treat non-degenerate non-empty output as a soft pass to avoid false negatives.
    const softPass = normalized.length >= 6 && !isDegenerateOutput(normalized)
    debugLog('runHealthCheck non-JSON soft pass', {
      softPass,
      preview: normalized.slice(0, 80),
    })
    return softPass
  }
}

async function ensureHealthyRuntime(config: {
  modelId: ModelPresetId
  language: 'en-US' | 'pt-BR'
  signal?: AbortSignal
  onProgress?: (progress: GenerationProgress) => void
  forceFallback?: boolean
}): Promise<RuntimeSelection> {
  const model = MODEL_PRESETS[config.modelId]
  const preferred = config.forceFallback
    ? { device: 'wasm' as const, dtype: 'q4' }
    : await detectBackend(config.modelId)
  const candidates = config.forceFallback ? [preferred] : getRuntimeCandidates(preferred)
  debugLog('ensureHealthyRuntime candidates', {
    modelId: config.modelId,
    candidates: candidates.map((c) => `${c.device}:${c.dtype}`),
    forceFallback: Boolean(config.forceFallback),
  })

  let lastError: unknown = null
  let bestEffortSelection: RuntimeSelection | null = null
  for (const candidate of candidates) {
    if (config.signal?.aborted) throw new Error('aborted')

    const cacheKey = getRuntimeCacheKey(model, candidate.device, candidate.dtype)
    const existing = runtimeHealthCache.get(cacheKey)
    if (existing) {
      try {
        debugLog('ensureHealthyRuntime cache hit', { cacheKey })
        return await existing
      } catch {
        runtimeHealthCache.delete(cacheKey)
        debugLog('ensureHealthyRuntime cache invalidated', { cacheKey })
      }
    }

    const selectionPromise = (async () => {
      const handle = await ensurePipeline({
        model,
        device: candidate.device,
        dtype: candidate.dtype,
        onProgress: config.onProgress,
      })

      config.onProgress?.({
        phase: 'compiling',
        percent: candidate.device === 'wasm' ? 42 : 40,
        label: 'Validating runtime...',
        uiStage: 'preparing',
      })

      const healthy = await runHealthCheck({
        handle,
        language: config.language,
        signal: config.signal,
      })

      const selection: RuntimeSelection = {
        device: candidate.device,
        dtype: candidate.dtype,
        handle,
      }

      if (!healthy) {
        debugLog('ensureHealthyRuntime healthcheck failed', {
          cacheKey,
          device: candidate.device,
          dtype: candidate.dtype,
        })
        throw new RuntimeHealthCheckError(selection)
      }

      debugLog('ensureHealthyRuntime selected', {
        cacheKey,
        device: candidate.device,
        dtype: candidate.dtype,
      })

      return selection
    })()

    runtimeHealthCache.set(cacheKey, selectionPromise)

    try {
      return await selectionPromise
    } catch (error) {
      runtimeHealthCache.delete(cacheKey)
      debugLog('ensureHealthyRuntime candidate rejected', {
        cacheKey,
        message: error instanceof Error ? error.message : String(error),
      })
      if (error instanceof RuntimeHealthCheckError) {
        if (!bestEffortSelection) {
          bestEffortSelection = error.selection
        }
      }
      lastError = error
    }
  }

  if (bestEffortSelection) {
    debugLog('ensureHealthyRuntime using best-effort selection', {
      device: bestEffortSelection.device,
      dtype: bestEffortSelection.dtype,
    })
    config.onProgress?.({
      phase: 'compiling',
      percent: 44,
      label: 'Runtime validation inconclusive. Continuing with safe defaults...',
      uiStage: 'preparing',
    })
    return bestEffortSelection
  }

  throw lastError instanceof Error ? lastError : new Error('No healthy runtime available')
}

export async function warmupHealthyGenerator(config: {
  modelId: ModelPresetId
  language: 'en-US' | 'pt-BR'
  signal?: AbortSignal
  onProgress?: (progress: GenerationProgress) => void
}): Promise<void> {
  await ensureHealthyRuntime({
    modelId: config.modelId,
    language: config.language,
    signal: config.signal,
    onProgress: config.onProgress,
  })
}

function buildMessages(config: {
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleId: string
  index: number
  avoidTitles: string[]
}) {
  const isPt = config.language === 'pt-BR'
  const avoid =
    config.avoidTitles.length > 0
      ? (isPt ? 'Evite estes títulos já usados: ' : 'Avoid these already-used titles: ') +
        config.avoidTitles.map((t) => `"${t}"`).join(', ') +
        '.'
      : ''

  const examplePt = {
    title: 'Uso de jatinho oficial em viagem privada',
    act: 'Usar aeronave oficial da Presidência para uma viagem particular de fim de semana',
    rival: 'Um ex-presidente conservador impopular',
    ally: 'Um presidente progressista em exercício, alinhado ao governo',
    context:
      'A imprensa nacional descobre a viagem e publica fotos; o custo é bancado pelo contribuinte.',
  }
  const exampleEn = {
    title: 'Use of official jet for a private trip',
    act: 'Use the official presidential aircraft for a personal weekend trip',
    rival: 'An unpopular former conservative president',
    ally: 'A sitting progressive president aligned with the ruling coalition',
    context: 'National media uncovers the trip and publishes photos; taxpayers foot the bill.',
  }

  const exampleJson = JSON.stringify(isPt ? examplePt : exampleEn)

  const systemPt = `Você gera cenários morais em JSON estrito. Responda APENAS com UM único objeto JSON válido, sem prosa, sem markdown, sem comentários. Chaves obrigatórias: "title", "act", "rival", "ally", "context". "act" é UMA ÚNICA ação idêntica atribuída a "rival" e a "ally". "rival" é uma figura conservadora/opositora impopular no país "${config.countryCode}". "ally" é uma figura progressista alinhada ao governo no país "${config.countryCode}". Escreva em português brasileiro. Exemplo de formato válido: ${exampleJson}`
  const systemEn = `You generate moral scenarios in strict JSON. Reply with ONE single valid JSON object only — no prose, no markdown, no comments. Required keys: "title", "act", "rival", "ally", "context". "act" is ONE identical action attributed to both "rival" and "ally". "rival" is an unpopular conservative/opposition figure in "${config.countryCode}". "ally" is a progressive figure aligned with the ruling coalition in "${config.countryCode}". Write in English. Example of a valid format: ${exampleJson}`

  const userPt = `Gere o cenário #${config.index + 1} testando o princípio moral "${config.principleId}" em ${config.countryCode}. ${avoid} Responda APENAS com o objeto JSON.`
  const userEn = `Generate scenario #${config.index + 1} testing the moral principle "${config.principleId}" in ${config.countryCode}. ${avoid} Respond with the JSON object ONLY.`

  return [
    { role: 'system', content: isPt ? systemPt : systemEn },
    { role: 'user', content: isPt ? userPt : userEn },
  ]
}

async function runGeneration(config: {
  handle: PipelineHandle
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleId: string
  index: number
  avoidTitles: string[]
  temperature: number
  signal?: AbortSignal
  onToken?: (chunk: string) => void
}): Promise<RawScenario | null> {
  const { TextStreamer } = await import('@huggingface/transformers')

  const messages = buildMessages({
    countryCode: config.countryCode,
    language: config.language,
    principleId: config.principleId,
    index: config.index,
    avoidTitles: config.avoidTitles,
  })

  let streamed = ''
  const streamer = new TextStreamer(
    config.handle.tokenizer as ConstructorParameters<typeof TextStreamer>[0],
    {
      skip_prompt: true,
      skip_special_tokens: true,
      callback_function: (text: string) => {
        streamed += text
        if (config.signal?.aborted) return
        config.onToken?.(text)
      },
    }
  )

  const output = await config.handle(messages, {
    max_new_tokens: GENERATION_MAX_NEW_TOKENS,
    do_sample: true,
    temperature: config.temperature,
    top_p: 0.9,
    repetition_penalty: 1.05,
    streamer,
  })

  if (config.signal?.aborted) throw new Error('aborted')

  const generated = output[0]?.generated_text
  let text = ''
  if (typeof generated === 'string') {
    text = generated
  } else if (Array.isArray(generated)) {
    const last = generated[generated.length - 1] as { content?: string } | undefined
    text = last?.content ?? ''
  }

  const candidates = [text, streamed].filter((s) => s && s.trim().length > 0)
  let sawDegenerateOutput = false
  for (const candidate of candidates) {
    if (isDegenerateOutput(candidate)) {
      sawDegenerateOutput = true
      // eslint-disable-next-line no-console
      console.warn('[aiScenarioGenerator] degenerate model output detected.', {
        preview: candidate.slice(0, 120),
      })
      continue
    }
    const items = extractJsonArray(candidate)
    if (items) {
      const validated = validateScenarios(items)
      if (validated.length > 0) return validated[0]
    }

    if (FAST_MODE) {
      const loose = materializeLooseScenario({
        partial: extractLooseScenario(candidate),
        language: config.language,
        countryCode: config.countryCode,
        principleId: config.principleId,
      })
      if (loose) {
        debugLog('runGeneration loose salvage hit', {
          principleId: config.principleId,
          titlePreview: loose.title.slice(0, 60),
        })
        return loose
      }
    }
  }

  if (sawDegenerateOutput) {
    throw new DegenerateGenerationError()
  }

  // eslint-disable-next-line no-console
  console.warn('[aiScenarioGenerator] no valid JSON parsed. Raw output:', {
    generated: text,
    streamed,
  })
  return null
}

/**
 * Generate mirrored scenarios on-device using an instruct LLM (SmolLM2 by
 * default). Batches all N scenarios into a single generation, parses strict
 * JSON, and retries with lowered temperature on validation failure. Returns
 * only entries that pass validation — no silent fallbacks.
 */
export async function generateAIScenarios(
  config: AIScenarioGeneratorConfig
): Promise<ScenarioPreset[]> {
  const { countryCode, language, principleIds, count, signal, onProgress, onToken } = config
  const activePrincipleIds = principleIds.length > 0 ? principleIds : ['equality']
  const selectedModelId = config.model ?? 'smollm2'
  debugLog('generateAIScenarios start', {
    modelId: selectedModelId,
    countryCode,
    language,
    count,
    principleIds: activePrincipleIds,
  })

  const attemptGeneration = async (runtime: {
    handle: PipelineHandle
    progressStart: number
    progressEnd: number
    label?: string
  }) => {
    const raw: RawScenario[] = []
    const temperatures = GENERATION_TEMPERATURES
    let runtimeDegraded = false

    onProgress?.({
      phase: 'generating',
      percent: runtime.progressStart,
      label: runtime.label ?? `Synthesizing ${count} scenarios one at a time...`,
      uiStage: 'drafting',
      itemsCompleted: 0,
      itemsTotal: count,
    })

    for (let i = 0; i < count; i++) {
      if (signal?.aborted) throw new Error('aborted')
      const principleId = activePrincipleIds[i % activePrincipleIds.length]
      let result: RawScenario | null = null
      for (let attemptIdx = 0; attemptIdx < temperatures.length; attemptIdx++) {
        const temperature = temperatures[attemptIdx]
        if (signal?.aborted) throw new Error('aborted')
        try {
          result = await runGeneration({
            handle: runtime.handle,
            countryCode,
            language,
            principleId,
            index: i,
            avoidTitles: raw.map((r) => r.title),
            temperature,
            signal,
            onToken,
          })
        } catch (error) {
          if (error instanceof DegenerateGenerationError) {
            runtimeDegraded = true
            debugLog('attemptGeneration runtime degraded', {
              scenarioIndex: i,
              principleId,
            })
            break
          }
          throw error
        }
        if (result) break
        const hasAnotherAttempt = attemptIdx < temperatures.length - 1
        if (!hasAnotherAttempt) continue
        onProgress?.({
          phase: 'generating',
          percent: toRangePercent(
            Math.round((i / count) * 100),
            runtime.progressStart,
            runtime.progressEnd
          ),
          label: `Retrying scenario ${i + 1}/${count} at lower temperature...`,
          uiStage: 'refining',
          itemsCompleted: i,
          itemsTotal: count,
        })
      }
      if (runtimeDegraded) {
        break
      }
      if (result) raw.push(result)
      onProgress?.({
        phase: 'generating',
        percent: toRangePercent(
          Math.round(((i + 1) / count) * 100),
          runtime.progressStart,
          runtime.progressEnd
        ),
        label: `Generated ${raw.length}/${count} scenarios.`,
        uiStage: i + 1 >= count ? 'finalizing' : 'drafting',
        itemsCompleted: i + 1,
        itemsTotal: count,
      })
    }

    return { raw, runtimeDegraded }
  }

  if (signal?.aborted) throw new Error('aborted')

  const healthyRuntime = await ensureHealthyRuntime({
    modelId: selectedModelId,
    language,
    signal,
    onProgress,
  })

  if (signal?.aborted) throw new Error('aborted')

  const firstAttempt = await attemptGeneration({
    handle: healthyRuntime.handle,
    progressStart: 42,
    progressEnd: 86,
  })
  let { raw } = firstAttempt
  const { runtimeDegraded } = firstAttempt
  debugLog('attemptGeneration complete', {
    runtime: `${healthyRuntime.device}:${healthyRuntime.dtype}`,
    generated: raw.length,
    runtimeDegraded,
  })

  if (FAST_MODE && !runtimeDegraded && raw.length > 0 && raw.length < count) {
    const missing = count - raw.length
    debugLog('fast refill start', {
      runtime: `${healthyRuntime.device}:${healthyRuntime.dtype}`,
      generated: raw.length,
      requested: count,
      missing,
    })

    onProgress?.({
      phase: 'generating',
      percent: 88,
      label: `Refining missing scenarios (${missing})...`,
      uiStage: 'refining',
      itemsCompleted: raw.length,
      itemsTotal: count,
    })

    const refillPrinciples = activePrincipleIds.length > 0 ? activePrincipleIds : ['equality']
    for (let attempt = 0; attempt < FAST_MODE_REFILL_MAX_ATTEMPTS && raw.length < count; attempt++) {
      if (signal?.aborted) throw new Error('aborted')
      const principleId = refillPrinciples[(raw.length + attempt) % refillPrinciples.length]
      let refillResult: RawScenario | null
      try {
        refillResult = await runGeneration({
          handle: healthyRuntime.handle,
          countryCode,
          language,
          principleId,
          index: raw.length,
          avoidTitles: raw.map((r) => r.title),
          temperature: GENERATION_TEMPERATURES[0],
          signal,
          onToken,
        })
      } catch (error) {
        if (error instanceof DegenerateGenerationError) {
          debugLog('fast refill degenerate output', { attempt: attempt + 1 })
          break
        }
        throw error
      }

      if (refillResult) {
        raw.push(refillResult)
        onProgress?.({
          phase: 'generating',
          percent: toRangePercent(
            Math.round((raw.length / count) * 100),
            88,
            96
          ),
          label: `Recovered ${raw.length}/${count} scenarios.`,
          uiStage: raw.length >= count ? 'finalizing' : 'refining',
          itemsCompleted: raw.length,
          itemsTotal: count,
        })
      }
    }

    debugLog('fast refill complete', { generated: raw.length, requested: count })
  }

  const shouldFallback =
    healthyRuntime.device !== 'wasm' &&
    (runtimeDegraded || (ENABLE_FALLBACK_ON_EMPTY && raw.length === 0))

  if (shouldFallback) {
    onProgress?.({
      phase: 'compiling',
      percent: 46,
      label: 'Retrying with safer runtime...',
      uiStage: 'refining',
      itemsCompleted: 0,
      itemsTotal: count,
    })

    const fallbackRuntime = await ensureHealthyRuntime({
      modelId: selectedModelId,
      language,
      signal,
      forceFallback: true,
      onProgress,
    })
    debugLog('fallback runtime selected', {
      runtime: `${fallbackRuntime.device}:${fallbackRuntime.dtype}`,
    })

    if (signal?.aborted) throw new Error('aborted')

    ;({ raw } = await attemptGeneration({
      handle: fallbackRuntime.handle,
      progressStart: 52,
      progressEnd: 92,
    }))
    debugLog('fallback attempt complete', { generated: raw.length })
  } else if (raw.length === 0) {
    debugLog('skip fallback on empty result', {
      runtime: `${healthyRuntime.device}:${healthyRuntime.dtype}`,
      fastMode: FAST_MODE,
    })
  }

  onProgress?.({
    phase: 'done',
    percent: 100,
    label: `Generated ${raw.length}/${count}`,
    uiStage: 'done',
    itemsCompleted: raw.length,
    itemsTotal: count,
  })

  const isPt = language === 'pt-BR'
  const now = Date.now()
  const scenarios: ScenarioPreset[] = raw.slice(0, count).map((r, i) => {
    const principleId = activePrincipleIds[i % activePrincipleIds.length]
    return {
      id: `ai-local-${now}-${i}`,
      principleId,
      title: r.title,
      category: `AI-${countryCode}/${principleId.toUpperCase()}`,
      exceptionCode: `CL_SEM_AI_${100 + Math.floor(Math.random() * 900)}_${i}`,
      exceptionType: 'ShiftingLogicException',
      caseStudyA: {
        type: 'RIVAL',
        subject: r.rival,
        act: r.act,
        context: r.context,
        expectedReaction: isPt
          ? 'Clamor de indignação pública imediato'
          : 'Absolute online outrage and public cancelations',
        justificationLogic: isPt
          ? 'Uso indevido inaceitável de prerrogativas do cargo'
          : 'Gross and unacceptable breach of ethical parameters',
      },
      caseStudyB: {
        type: 'ALLY',
        subject: r.ally,
        act: r.act,
        context: r.context,
        expectedReaction: isPt
          ? 'Compreensão ou justificativa matizada'
          : 'Nuanced defense of societal purpose alignment',
        justificationLogic: isPt
          ? 'A causa nobre atenua qualquer transgressão'
          : 'The progressive target metrics justify situational flexibilities',
      },
    }
  })
  debugLog('generateAIScenarios finish', { returned: scenarios.length, requested: count })
  return scenarios
}
