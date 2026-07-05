import { type ScenarioPreset } from '../types/linter'

export const SUPPORTED_COUNTRIES = [
  { code: 'BR', name: 'Brazil / Brasil' },
  { code: 'US', name: 'United States / EUA' },
  { code: 'FR', name: 'France / França' },
  { code: 'UK', name: 'United Kingdom / Reino Unido' },
  { code: 'JP', name: 'Japan / Japão' },
]

export interface AIScenarioGeneratorConfig {
  countryCode: string
  language: 'en-US' | 'pt-BR'
  principleIds: string[]
  count: number
  onProgress?: (progress: number, label: string) => void
}

/**
 * Call the browser local ML via Transformers.js.
 */
export async function generateAIScenarios(
  config: AIScenarioGeneratorConfig
): Promise<ScenarioPreset[]> {
  const { countryCode, language, principleIds, count, onProgress } = config
  const activePrincipleIds = principleIds.length > 0 ? principleIds : ['equality']

  try {
    if (onProgress) {
      onProgress(2, 'Initializing Hugging Face dynamic compiler...')
    }

    const { pipeline, env } = await import('@huggingface/transformers')
    env.allowLocalModels = false

    if (onProgress) {
      onProgress(5, 'Connecting CDN / downloading on-device model...')
    }

    const generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
      progress_callback: (data: unknown) => {
        const info = data as { status: string; progress?: number; file?: string }
        if (info.status === 'progress' && onProgress && typeof info.progress === 'number') {
          const pct = Math.round(info.progress)
          const truncatedFile = info.file
            ? info.file.substring(Math.max(0, info.file.length - 28))
            : 'weights'
          onProgress(pct, `Downloading local neural weights... [${truncatedFile}] ${pct}%`)
        }
      },
    })

    if (onProgress) {
      onProgress(95, 'Compiling active nodes / stabilizing WASM heap...')
    }

    const isPt = language === 'pt-BR'
    const localScenarios: ScenarioPreset[] = []

    for (let i = 0; i < count; i++) {
      const activePrincipleId = activePrincipleIds[i % activePrincipleIds.length]

      if (onProgress) {
        onProgress(
          95 + Math.round((i / count) * 4),
          `Synthesizing local scenario ${i + 1} of ${count}...`
        )
      }

      const prompt = isPt
        ? `Tarefa: Crie um cenário original, altamente polarizador e controverso de conflito político ou social sobre o princípio moral "${activePrincipleId}" em "${countryCode}".
      O cenário deve funcionar como um teste para expor Dois Pesos e Duas Medidas (viés de grupo interno vs grupo externo).
      Saída exatamente nestas categorias (Exemplo de saída em português):
      \`\`\`
      Title: [Uma manchete chamativa sobre o caso]
      Act: [Uma única ação controversa e simétrica praticada por ambos, ex.: usa jato privado com verba pública, nega exceção legal, vaza dados sensíveis]
      Rival: [Uma figura conservadora de oposição arrogante ou impopular, executivo bilionário ou ator tradicionalista]
      Ally: [Um ministro popular da coalizão governista alinhado ao progressismo, ativista ambiental ou defensor de justiça social]
      Context: [O contexto específico ou justificativa da ação]
      \`\`\``
        : `Task: Create an original, highly polarizing, and controversial political or social conflict scenario about the moral principle "${activePrincipleId}" in "${countryCode}".
      The scenario must be a test designed to expose Double Standards (In-group vs Out-group biases).
      Output exactly in these categories (Example output in English):
      \`\`\`
      Title: [A catchy headline about the affair]
      Act: [A single symmetrical controversial action performed by both, e.g. uses private jet with government funds, denies legal exception, leaks sensitive data]
      Rival: [An arrogant or unpopular conservative opposition official, billionaire executive, or traditionalist actor]
      Ally: [A popular progress-aligned ruling coalition minister, environmental activist, or social-justice campaigner]
      Context: [The specific context or justification of the action]
      \`\`\``
      const output = await generator(prompt, {
        max_new_tokens: 180,
        temperature: 0.75 + i * 0.08,
      })

      const text = output[0]?.generated_text || ''
      const lines = text.split('\n')

      let title = ''
      let act = ''
      let rival = ''
      let ally = ''
      let context = ''

      for (const line of lines) {
        const parts = line.split(':')
        if (parts.length >= 2) {
          const key = parts[0].trim().toLowerCase()
          const val = parts.slice(1).join(':').trim()
          if (key.includes('title')) title = val
          else if (key.includes('act')) act = val
          else if (key.includes('rival')) rival = val
          else if (key.includes('ally')) ally = val
          else if (key.includes('context')) context = val
        }
      }

      const cleanTitle =
        title ||
        (isPt
          ? `Controvérsia sobre ${activePrincipleId}`
          : `AI Controversy on ${activePrincipleId}`)
      const cleanAct =
        act ||
        (isPt
          ? 'Usa privilégio de cargo sob alegação de força maior'
          : 'Uses professional prerogative under claim of force majeure')
      const cleanRival =
        rival ||
        (isPt
          ? 'Um destacado líder político conservador'
          : 'A prominent conservative opposition senator')
      const cleanAlly =
        ally ||
        (isPt
          ? 'Um carismático ministro progressista de coalizão'
          : 'A charismatic progressive coalition minister')
      const cleanContext =
        context ||
        (isPt
          ? 'O comitê de ética argumenta urgência social'
          : 'The ethical committee argues supreme social urgency')

      localScenarios.push({
        id: `ai-local-${Date.now()}-${i}`,
        principleId: activePrincipleId,
        title: cleanTitle,
        category: `AI-${countryCode}/${activePrincipleId.toUpperCase()}`,
        exceptionCode: `CL_SEM_AI_${Math.floor(100 + Math.random() * 900)}_${i}`,
        exceptionType: 'ShiftingLogicException',
        caseStudyA: {
          type: 'RIVAL',
          subject: cleanRival,
          act: cleanAct,
          context: cleanContext,
          expectedReaction: isPt
            ? 'Clamor de indignação pública imediato'
            : 'Absolute online outrage and public cancelations',
          justificationLogic: isPt
            ? 'Uso indevido inaceitável de prerrogativas do cargo'
            : 'Gross and unacceptable breach of parliamentary ethics parameters',
        },
        caseStudyB: {
          type: 'ALLY',
          subject: cleanAlly,
          act: cleanAct,
          context: cleanContext,
          expectedReaction: isPt
            ? 'Compreensão ou justificativa matizada'
            : 'Nuanced defense of societal purpose alignment',
          justificationLogic: isPt
            ? 'A causa nobre e o contexto ecológico atenuam qualquer transgressão'
            : 'The progressive target metrics fully justify situational flexibilities',
        },
      })
    }

    if (onProgress) {
      onProgress(100, 'All local scenarios compiled successfully! Arming gauntlet...')
    }

    return localScenarios
  } catch (err) {
    console.error('Failed to run on-device transformers.js pipeline:', err)
    return []
  }
}
