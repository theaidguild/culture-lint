import {
  generateAIScenariosWithRunpod,
  type ModelPresetId,
  type GenerationProgress,
} from './aiScenarioGenerator'
import type { ScenarioPreset } from '../types/linter'
import i18n from '../i18n'

export type AIStatusKind = 'idle' | 'generate' | 'error'

export type AIStatusSnapshot = {
  kind: AIStatusKind
  requestId?: string
  modelId?: ModelPresetId
  phase?: GenerationProgress['phase']
  percent?: number
  label?: string
  message?: string
}

const AI_STATUS_KEY = 'culture-lint:ai-status'
const AI_STATUS_EVENT = 'culture-lint-ai-status'

type PendingRequest = {
  type: 'generate'
  modelId: ModelPresetId
  controller: AbortController
  onProgress?: (progress: GenerationProgress) => void
}

type GenerateParams = {
  modelId: ModelPresetId
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleIds: string[]
  count: number
  onProgress?: (progress: GenerationProgress) => void
}

const AI_DEBUG_PREFIX = '[ai-debug][client]'
function debugLog(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
}

function localizeStatusLabel(language: 'en-US' | 'pt-BR'): string {
  return i18n.t('aiStatus.startGenerate', { lng: language })
}

function setAIStatus(snapshot: AIStatusSnapshot) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(AI_STATUS_KEY, JSON.stringify(snapshot))
    window.dispatchEvent(new Event(AI_STATUS_EVENT))
  } catch {
    // Diagnostics only; ignore storage failures.
  }
}

export function readAIStatusSnapshot(): AIStatusSnapshot | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(AI_STATUS_KEY)
    return raw ? (JSON.parse(raw) as AIStatusSnapshot) : null
  } catch {
    return null
  }
}

export function subscribeAIStatus(onChange: () => void) {
  if (typeof window === 'undefined') return () => undefined

  window.addEventListener(AI_STATUS_EVENT, onChange)
  window.addEventListener('storage', onChange)
  return () => {
    window.removeEventListener(AI_STATUS_EVENT, onChange)
    window.removeEventListener('storage', onChange)
  }
}

let requestCounter = 0
const pendingRequests = new Map<string, PendingRequest>()

function nextRequestId() {
  requestCounter += 1
  return `ai-shared-${requestCounter}`
}

export function requestAIGenerate(params: GenerateParams): {
  requestId: string
  promise: Promise<ScenarioPreset[]>
} {
  const requestId = nextRequestId()
  debugLog('request generate', {
    requestId,
    modelId: params.modelId,
    countryCode: params.countryCode,
    count: params.count,
  })

  setAIStatus({
    kind: 'generate',
    requestId,
    modelId: params.modelId,
    phase: 'generating',
    percent: 0,
    label: localizeStatusLabel(params.language),
  })

  const controller = new AbortController()
  pendingRequests.set(requestId, {
    type: 'generate',
    modelId: params.modelId,
    controller,
    onProgress: params.onProgress,
  })

  const promise = generateAIScenariosWithRunpod({
    model: params.modelId,
    countryCode: params.countryCode,
    language: params.language,
    principleIds: params.principleIds,
    count: params.count,
    signal: controller.signal,
    onProgress: (progress) => {
      setAIStatus({
        kind: 'generate',
        requestId,
        modelId: params.modelId,
        phase: progress.phase,
        percent: progress.percent,
        label: progress.label,
      })
      params.onProgress?.(progress)
    },
  })
    .then((scenarios) => {
      setAIStatus({ kind: 'idle', requestId, modelId: params.modelId })
      return scenarios
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') {
        setAIStatus({ kind: 'idle', requestId, modelId: params.modelId, message: 'aborted' })
        throw new Error('aborted')
      }
      setAIStatus({ kind: 'error', requestId, modelId: params.modelId, message: String(error) })
      throw error
    })
    .finally(() => {
      pendingRequests.delete(requestId)
    })

  return { requestId, promise }
}

export function cancelAIRequest(requestId: string) {
  debugLog('cancel request', { requestId })
  setAIStatus({ kind: 'idle', requestId, message: 'canceled' })
  const pending = pendingRequests.get(requestId)
  if (pending) {
    pending.controller.abort()
  }
}
