import {
  generateAIScenariosWithRunpod,
  type ModelPresetId,
  type GenerationProgress,
} from './aiScenarioGenerator'
import type { ScenarioPreset } from '../types/linter'

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
      params.onProgress?.(progress)
    },
  })
    .then((scenarios) => {
      return scenarios
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('aborted')
      }
      throw error
    })
    .finally(() => {
      pendingRequests.delete(requestId)
    })

  return { requestId, promise }
}

export function cancelAIRequest(requestId: string) {
  debugLog('cancel request', { requestId })
  const pending = pendingRequests.get(requestId)
  if (pending) {
    pending.controller.abort()
  }
}
