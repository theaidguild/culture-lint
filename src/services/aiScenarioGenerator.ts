import { type ScenarioPreset } from '../types/linter'

export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brazil / Brasil' },
  { code: 'US', name: 'United States / EUA' },
  { code: 'FR', name: 'France / França' },
  { code: 'UK', name: 'United Kingdom / Reino Unido' },
  { code: 'JP', name: 'Japan / Japão' },
]

export const MODEL_PRESETS = {
  smollm2: 'HuggingFaceTB/SmolLM2-360M-Instruct',
  qwen25: 'onnx-community/Qwen2.5-0.5B-Instruct',
} as const

export type ModelPresetId = keyof typeof MODEL_PRESETS

export type Backend = 'webgpu' | 'wasm'
export type GenerationPhase = 'idle' | 'downloading' | 'compiling' | 'generating' | 'done'

export interface GenerationProgress {
  phase: GenerationPhase
  percent: number
  label: string
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
        // Qwen2.5-0.5B in q4f16 is known to degenerate on many GPUs; use q4.
        const dtype = modelId === 'qwen25' ? 'q4' : 'q4f16'
        return { device: 'webgpu', dtype }
      }
    } catch {
      // fall through
    }
  }
  return { device: 'wasm', dtype: 'q4' }
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
    config.onProgress?.({ phase: 'compiling', percent: 100, label: 'Pipeline cache HIT' })
    return existing
  }

  const load = (async () => {
    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowLocalModels = false

    config.onProgress?.({
      phase: 'downloading',
      percent: 1,
      label: `Loading ${config.model} on ${config.device.toUpperCase()} (${config.dtype})...`,
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
            percent: pct,
            label: `Downloading weights [${info.file.slice(-28)}] ${pct}%`,
          })
        } else if (info.status === 'ready' || info.status === 'done') {
          config.onProgress?.({
            phase: 'compiling',
            percent: 97,
            label: 'Compiling ONNX graph / warming kernels...',
          })
        }
      },
    })) as unknown as PipelineHandle

    config.onProgress?.({
      phase: 'compiling',
      percent: 99,
      label: 'Pipeline ready.',
    })
    return handle
  })()

  pipelineCache.set(key, load)
  try {
    return await load
  } catch (err) {
    pipelineCache.delete(key)
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

const isNonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 3

function stripFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrappers the model likes to add.
  return text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
}

function tryParse(slice: string): unknown[] | null {
  const attempts = [
    slice,
    // Strip trailing commas before `]` or `}`.
    slice.replace(/,\s*(\]|\})/g, '$1'),
  ]
  for (const attempt of attempts) {
    try {
      const parsed = JSON.parse(attempt)
      if (Array.isArray(parsed)) return parsed
    } catch {
      // try next
    }
  }
  return null
}

function extractJsonArray(rawText: string): unknown[] | null {
  const text = stripFences(rawText)
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

function validateScenarios(items: unknown[]): RawScenario[] {
  const valid: RawScenario[] = []
  for (const item of items) {
    if (!item || typeof item !== 'object') continue
    const obj = item as Record<string, unknown>
    if (
      isNonEmptyString(obj.title) &&
      isNonEmptyString(obj.act) &&
      isNonEmptyString(obj.rival) &&
      isNonEmptyString(obj.ally) &&
      isNonEmptyString(obj.context)
    ) {
      valid.push({
        title: obj.title.trim(),
        act: obj.act.trim(),
        rival: obj.rival.trim(),
        ally: obj.ally.trim(),
        context: obj.context.trim(),
      })
    }
  }
  return valid
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
    context:
      'National media uncovers the trip and publishes photos; taxpayers foot the bill.',
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
    max_new_tokens: 384,
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
  for (const candidate of candidates) {
    const items = extractJsonArray(candidate)
    if (items) {
      const validated = validateScenarios(items)
      if (validated.length > 0) return validated[0]
    }
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
  const modelId = MODEL_PRESETS[config.model ?? 'smollm2']

  if (signal?.aborted) throw new Error('aborted')

  const backend = await detectBackend(config.model ?? 'smollm2')
  onProgress?.({
    phase: 'downloading',
    percent: 0,
    label: `Backend selected: ${backend.device.toUpperCase()} (${backend.dtype})`,
  })

  const handle = await ensurePipeline({
    model: modelId,
    device: backend.device,
    dtype: backend.dtype,
    onProgress,
  })

  if (signal?.aborted) throw new Error('aborted')

  onProgress?.({
    phase: 'generating',
    percent: 0,
    label: `Synthesizing ${count} scenarios one at a time...`,
  })

  const raw: RawScenario[] = []
  const temperatures = [0.8, 0.65, 0.5]
  for (let i = 0; i < count; i++) {
    if (signal?.aborted) throw new Error('aborted')
    const principleId = activePrincipleIds[i % activePrincipleIds.length]
    let result: RawScenario | null = null
    for (const temperature of temperatures) {
      if (signal?.aborted) throw new Error('aborted')
      result = await runGeneration({
        handle,
        countryCode,
        language,
        principleId,
        index: i,
        avoidTitles: raw.map((r) => r.title),
        temperature,
        signal,
        onToken,
      })
      if (result) break
      onProgress?.({
        phase: 'generating',
        percent: Math.round((i / count) * 100),
        label: `Retrying scenario ${i + 1}/${count} at lower temperature...`,
      })
    }
    if (result) raw.push(result)
    onProgress?.({
      phase: 'generating',
      percent: Math.round(((i + 1) / count) * 100),
      label: `Generated ${raw.length}/${count} scenarios.`,
    })
  }

  onProgress?.({ phase: 'done', percent: 100, label: `Generated ${raw.length}/${count}` })

  const isPt = language === 'pt-BR'
  const now = Date.now()
  return raw.slice(0, count).map((r, i) => {
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
}
