import type { AIWorkerRequest, AIWorkerResponse } from './aiGeneratorWorkerProtocol'
import type { ModelPresetId, GenerationProgress } from './aiScenarioGenerator'
import type { ScenarioPreset } from '../types/linter'

export type AIStatusKind = 'idle' | 'warmup' | 'generate' | 'error'

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
  type: 'warmup' | 'generate'
  modelId: ModelPresetId
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
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
    // eslint-disable-next-line no-console
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  // eslint-disable-next-line no-console
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
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

let workerRef: Worker | null = null
let requestCounter = 0
const pendingRequests = new Map<string, PendingRequest>()
const warmupPromises = new Map<string, Promise<void>>()
const warmedKeys = new Set<string>()

function nextRequestId() {
  requestCounter += 1
  return `ai-shared-${requestCounter}`
}

function clearWorker() {
  workerRef?.terminate()
  workerRef = null
}

function rejectAllPending(reason: string) {
  for (const pending of pendingRequests.values()) {
    pending.reject(new Error(reason))
  }
  pendingRequests.clear()
}

function getWorker() {
  if (workerRef) {
    return workerRef
  }

  const worker = new Worker(new URL('../workers/aiGenerator.worker.ts', import.meta.url), {
    type: 'module',
  })

  worker.onmessage = (event: MessageEvent<AIWorkerResponse>) => {
    const message = event.data
    const pending = pendingRequests.get(message.requestId)

    if (message.type === 'progress') {
      pending?.onProgress?.(message.progress)
      if (pending?.type === 'warmup') {
        setAIStatus({
          kind: 'warmup',
          requestId: message.requestId,
          modelId: pending.modelId,
          phase: message.progress.phase,
          percent: message.progress.percent,
          label: message.progress.label,
        })
      } else if (pending?.type === 'generate') {
        setAIStatus({
          kind: 'generate',
          requestId: message.requestId,
          modelId: pending.modelId,
          phase: message.progress.phase,
          percent: message.progress.percent,
          label: message.progress.label,
        })
      }
      return
    }

    if (!pending) {
      return
    }

    pendingRequests.delete(message.requestId)

    if (message.type === 'warmup-complete') {
      setAIStatus({ kind: 'idle', requestId: message.requestId })
      pending.resolve()
      return
    }

    if (message.type === 'generate-complete') {
      setAIStatus({ kind: 'idle', requestId: message.requestId })
      pending.resolve(message.scenarios)
      return
    }

    if (message.type === 'canceled') {
      setAIStatus({ kind: 'idle', requestId: message.requestId, message: 'aborted' })
      pending.reject(new Error('aborted'))
      return
    }

    setAIStatus({ kind: 'error', requestId: message.requestId, message: message.message })
    pending.reject(new Error(message.message))
  }

  worker.onerror = () => {
    debugLog('worker runtime error')
    setAIStatus({ kind: 'error', message: 'worker-error' })
    rejectAllPending('worker-error')
    clearWorker()
  }

  workerRef = worker
  return worker
}

function post(request: AIWorkerRequest, pending: PendingRequest) {
  pendingRequests.set(request.requestId as string, pending)
  getWorker().postMessage(request)
}

export function requestAIWarmup(params: {
  modelId: ModelPresetId
  language: 'en-US' | 'pt-BR'
  onProgress?: (progress: GenerationProgress) => void
}): Promise<void> {
  const warmupKey = `${params.modelId}|${params.language}`

  if (warmedKeys.has(warmupKey)) {
    return Promise.resolve()
  }

  const existing = warmupPromises.get(warmupKey)
  if (existing) {
    return existing
  }

  const requestId = nextRequestId()
  debugLog('request warmup', { requestId, warmupKey })
  setAIStatus({
    kind: 'warmup',
    requestId,
    modelId: params.modelId,
    phase: 'downloading',
    percent: 0,
    label: 'Starting warmup...',
  })

  const promise = new Promise<void>((resolve, reject) => {
    post(
      {
        type: 'warmup',
        requestId,
        modelId: params.modelId,
        language: params.language,
      },
      {
        type: 'warmup',
        modelId: params.modelId,
        onProgress: (progress) => {
          setAIStatus({
            kind: 'warmup',
            requestId,
            modelId: params.modelId,
            phase: progress.phase,
            percent: progress.percent,
            label: progress.label,
          })
          params.onProgress?.(progress)
        },
        resolve: () => {
          warmedKeys.add(warmupKey)
          warmupPromises.delete(warmupKey)
          setAIStatus({ kind: 'idle', requestId, modelId: params.modelId })
          resolve()
        },
        reject: (error) => {
          warmupPromises.delete(warmupKey)
          setAIStatus({ kind: 'error', requestId, modelId: params.modelId, message: String(error) })
          reject(error)
        },
      }
    )
  })

  warmupPromises.set(warmupKey, promise)
  return promise
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
    label: 'Starting generation...',
  })

  const promise = new Promise<ScenarioPreset[]>((resolve, reject) => {
    post(
      {
        type: 'generate',
        requestId,
        modelId: params.modelId,
        countryCode: params.countryCode,
        language: params.language,
        principleIds: params.principleIds,
        count: params.count,
      },
      {
        type: 'generate',
        modelId: params.modelId,
        resolve: (value) => {
          setAIStatus({ kind: 'idle', requestId, modelId: params.modelId })
          resolve((value ?? []) as ScenarioPreset[])
        },
        reject: (error) => {
          setAIStatus({ kind: 'error', requestId, modelId: params.modelId, message: String(error) })
          reject(error)
        },
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
      }
    )
  })

  return { requestId, promise }
}

export function cancelAIRequest(requestId: string) {
  debugLog('cancel request', { requestId })
  setAIStatus({ kind: 'idle', requestId, message: 'canceled' })
  getWorker().postMessage({ type: 'cancel', requestId })
  const pending = pendingRequests.get(requestId)
  if (pending) {
    pendingRequests.delete(requestId)
    pending.reject(new Error('aborted'))
  }
}
