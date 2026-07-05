/// <reference lib="webworker" />

import {
  generateAIScenarios,
  warmupHealthyGenerator,
} from '../services/aiScenarioGenerator'
import type {
  AIWorkerRequest,
  AIWorkerResponse,
} from '../services/aiGeneratorWorkerProtocol'

let activeController: AbortController | null = null
let activeRequestId: string | null = null

const AI_DEBUG_PREFIX = '[ai-debug][worker]'
function debugLog(message: string, meta?: Record<string, unknown>) {
  if (meta) {
    // eslint-disable-next-line no-console
    console.debug(`${AI_DEBUG_PREFIX} ${message}`, meta)
    return
  }
  // eslint-disable-next-line no-console
  console.debug(`${AI_DEBUG_PREFIX} ${message}`)
}

function postMessageToMain(message: AIWorkerResponse) {
  self.postMessage(message)
}

function abortActiveRequest() {
  if (activeRequestId) {
    debugLog('abort active request', { activeRequestId })
  }
  activeController?.abort()
}

self.onmessage = (event: MessageEvent<AIWorkerRequest>) => {
  const request = event.data
  debugLog('incoming message', {
    type: request.type,
    requestId: 'requestId' in request ? request.requestId : undefined,
  })

  if (request.type === 'cancel') {
    debugLog('cancel received', { requestId: request.requestId })
    abortActiveRequest()
    return
  }

  abortActiveRequest()
  const controller = new AbortController()
  activeController = controller
  activeRequestId = request.requestId

  void (async () => {
    try {
      if (request.type === 'warmup') {
        debugLog('warmup start', {
          requestId: request.requestId,
          modelId: request.modelId,
          language: request.language,
        })
        await warmupHealthyGenerator({
          modelId: request.modelId,
          language: request.language,
          signal: controller.signal,
        })

        if (controller.signal.aborted) {
          debugLog('warmup canceled', { requestId: request.requestId })
          postMessageToMain({ type: 'canceled', requestId: request.requestId })
          return
        }

        debugLog('warmup complete', { requestId: request.requestId })
        postMessageToMain({ type: 'warmup-complete', requestId: request.requestId })
        return
      }

      debugLog('generate start', {
        requestId: request.requestId,
        modelId: request.modelId,
        count: request.count,
        countryCode: request.countryCode,
        principleIds: request.principleIds,
      })

      const scenarios = await generateAIScenarios({
        countryCode: request.countryCode,
        language: request.language,
        principleIds: request.principleIds,
        count: request.count,
        model: request.modelId,
        signal: controller.signal,
        onProgress: (progress) => {
          debugLog('progress', {
            requestId: request.requestId,
            phase: progress.phase,
            percent: progress.percent,
            uiStage: progress.uiStage,
            label: progress.label,
          })
          postMessageToMain({
            type: 'progress',
            requestId: request.requestId,
            progress,
          })
        },
      })

      if (controller.signal.aborted) {
        debugLog('generate canceled', { requestId: request.requestId })
        postMessageToMain({ type: 'canceled', requestId: request.requestId })
        return
      }

      debugLog('generate complete', { requestId: request.requestId, scenarios: scenarios.length })
      postMessageToMain({
        type: 'generate-complete',
        requestId: request.requestId,
        scenarios,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        debugLog('request canceled after error path', { requestId: request.requestId })
        postMessageToMain({ type: 'canceled', requestId: request.requestId })
        return
      }

      const message = error instanceof Error ? error.message : String(error)
      debugLog('request failed', {
        requestId: request.requestId,
        message,
      })
      postMessageToMain({
        type: 'error',
        requestId: request.requestId,
        message,
      })
    } finally {
      if (activeRequestId === request.requestId) {
        activeController = null
        activeRequestId = null
      }
    }
  })()
}

export {}
