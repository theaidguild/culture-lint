import type { GenerationProgress, ModelPresetId } from './aiScenarioGenerator'
import type { ScenarioPreset } from '../types/linter'

export type WarmupWorkerRequest = {
  type: 'warmup'
  requestId: string
  modelId: ModelPresetId
  language: 'en-US' | 'pt-BR'
}

export type GenerateWorkerRequest = {
  type: 'generate'
  requestId: string
  modelId: ModelPresetId
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleIds: string[]
  count: number
}

export type CancelWorkerRequest = {
  type: 'cancel'
  requestId?: string
}

export type AIWorkerRequest = WarmupWorkerRequest | GenerateWorkerRequest | CancelWorkerRequest

export type ProgressWorkerResponse = {
  type: 'progress'
  requestId: string
  progress: GenerationProgress
}

export type WarmupCompleteWorkerResponse = {
  type: 'warmup-complete'
  requestId: string
}

export type GenerateCompleteWorkerResponse = {
  type: 'generate-complete'
  requestId: string
  scenarios: ScenarioPreset[]
}

export type ErrorWorkerResponse = {
  type: 'error'
  requestId: string
  message: string
}

export type CanceledWorkerResponse = {
  type: 'canceled'
  requestId: string
}

export type AIWorkerResponse =
  | ProgressWorkerResponse
  | WarmupCompleteWorkerResponse
  | GenerateCompleteWorkerResponse
  | ErrorWorkerResponse
  | CanceledWorkerResponse
