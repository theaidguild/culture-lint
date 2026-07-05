import type { AIWorkerRequest, AIWorkerResponse } from './aiGeneratorWorkerProtocol'
import type { ModelPresetId, GenerationProgress } from './aiScenarioGenerator'
import type { ScenarioPreset } from '../types/linter'

type PendingRequest = {
  type: 'warmup' | 'generate'
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
      return
    }

    if (!pending) {
      return
    }

    pendingRequests.delete(message.requestId)

    if (message.type === 'warmup-complete') {
      pending.resolve()
      return
    }

    if (message.type === 'generate-complete') {
      pending.resolve(message.scenarios)
      return
    }

    if (message.type === 'canceled') {
      pending.reject(new Error('aborted'))
      return
    }

    pending.reject(new Error(message.message))
  }

  worker.onerror = () => {
    debugLog('worker runtime error')
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
        resolve: () => {
          warmedKeys.add(warmupKey)
          warmupPromises.delete(warmupKey)
          resolve()
        },
        reject: (error) => {
          warmupPromises.delete(warmupKey)
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
        resolve: (value) => resolve((value ?? []) as ScenarioPreset[]),
        reject,
        onProgress: params.onProgress,
      }
    )
  })

  return { requestId, promise }
}

export function cancelAIRequest(requestId: string) {
  debugLog('cancel request', { requestId })
  getWorker().postMessage({ type: 'cancel', requestId })
  const pending = pendingRequests.get(requestId)
  if (pending) {
    pendingRequests.delete(requestId)
    pending.reject(new Error('aborted'))
  }
}
