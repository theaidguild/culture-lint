const ptBR = {
  translation: {
    appName: 'Culture-Lint',
    boot: {
      ariaLabel: 'Inicializando o motor Culture-Lint',
      lines: {
        coldBoot: 'sequência de inicialização a frio iniciada',
        reserveHeap: 'reservando heap de {{heap}} ................ OK',
        mapSpace: 'mapeando espaço de endereçamento virtual ........ OK',
        stabilizeMetrics: 'estabilizando métricas de discurso público . OK',
        handshakeStream: 'handshake discourse.stream[:443] ..... OK',
        loadValidators: 'carregando validadores centrais .............. OK',
        compileRuleset: 'compilando conjunto de regras de detecção de viés ..... OK',
        readManifest: 'lendo ideology.manifest ...',
        deprecatedModule: 'módulo "{{module}}" obsoleto',
        stripModule: 'removendo {{module}} do alvo de build',
        rebindValidators: 'reconectando validadores sem ganchos de empatia  OK',
        mountEngine: 'montando o motor do linter ideológico ...',
        engineOnline: 'motor Culture-Lint ONLINE',
      },
    },
    progress: {
      biasDetection: 'Checagem de viés',
      metadataAssignment: 'Detalhes do caso',
      resultAnalysis: 'Resultado final',
    },
    sidebar: {
      returnInitialState: 'Voltar para o início',
    },
    topbar: {
      compileFailed: 'COMPILAÇÃO FALHOU',
      analyst: 'analista_04',
    },
    language: {
      label: 'Idioma',
      ptBR: 'PT-BR',
      enUS: 'EN-US',
    },
    reactions: {
      absoluteOutrage: 'Indignação absoluta',
      nuancedDefense: 'Defesa contextual',
    },
    step1: {
      progress: 'ETAPA 1 DE 3',
      title: 'Etapa 1: Defina seu princípio inegociável',
      description:
        'Escolha uma regra central que sua organização não pode quebrar. Ela será a base para todas as próximas verificações do Culture-Lint.',
      selected: '[SELECIONADO]',
      next: 'PRÓXIMO >',
    },
    step2: {
      armed: '// Analisador suprapartidário pronto',
      title: 'Etapa 2: Preencha os dados do estudo de caso',
      description: 'Defina os atores e as ações para habilitar a análise semântica cruzada.',
      filterPresets: '[FILTRAR_PRESETS]',
      searchPlaceholder: 'Busque por título, categoria, id ou código...',
      scenarioPreset: '[PRESET_CENARIO]',
      noScenariosMatch: 'Nenhum cenário encontrado com esse filtro.',
      presetsVisible: '// PRESETS: {{visible}}/{{total}} visíveis',
      exceptionProfile: '// PERFIL DA EXCEÇÃO: {{exceptionType}} ({{exceptionCode}})',
      eventA: 'Evento A (Rival):',
      eventB: 'Evento B (Aliado):',
      compiling: 'COMPILANDO ÁRVORE SEMÂNTICA...',
      compile: 'COMPILAR ESTUDO DE CASO',
      shortcut: '[ CMD + ENTER ] para continuar',
    },
    caseStudy: {
      scenarioDescription: 'DESCRIÇÃO DO CENÁRIO',
      subject: '[SUJEITO]',
      act: '[AÇÃO]',
      context: '[CONTEXTO]',
    },
    step3: {
      title: 'Etapa 3: Resultados da compilação',
      failedPrefix: '{{exception}} detectada. O princípio que você definiu não passou na análise de integridade estrutural.',
      successPrefix: 'Nenhuma exceção detectada. O princípio que você definiu passou na análise de integridade estrutural.',
      analysisComplete: 'ANÁLISE CONCLUÍDA',
    },
    terminal: {
      header: 'SAÍDA DO TERMINAL DO COMPILADOR',
      compileInfo: 'Compilando o estudo de caso...',
      eventAPassed: 'Status da build para o Evento A: APROVADO',
      eventALine: 'Evento A: {{subject}} - {{act}}',
      eventBLine: 'Evento B: {{subject}} - {{act}}',
      expectedReaction: 'Reação esperada: {{reaction}} {{symbol}}',
      moralJustification: 'Justificativa moral: "{{text}}" {{symbol}}',
      verdict: 'Veredito:',
      reactionRouted: 'REAÇÃO ENCAMINHADA: {{reaction}} {{symbol}}',
      compilationFailed: '[ERRO] Compilação falhou: {{exception}}',
      location: 'Localização:',
      locationValue: 'Linha 13, Coluna 9 (Tabela de exemplos)',
      errorCode: 'Código do erro:',
      description: 'Descrição:',
      compilationSucceeded: '[PASS] Compilação concluída com sucesso',
      traceback: 'Rastreamento:',
      trace1: 'Dado que uma figura pública faz uma declaração "objetivamente ofensiva"...',
      trace2: 'Quando o público avalia essa declaração...',
      trace3: 'Então a reação coletiva deveria ser',
      dynamicMutation: '[MUTAÇÃO_DINÂMICA]',
      codeSmell: 'Padrão de código detectado: roteamento baseado em identidade',
      buildStatusFailed: 'Status da build: FALHOU (1 erro, 0 avisos. Tempo de execução: 42ms)',
      buildStatusSuccess: 'Status da build: SUCESSO (0 erros, 0 avisos. Tempo de execução: 42ms)',
    },
    errors: {
      reactionMutation:
        "A propriedade 'Reação' mudou dinamicamente de '{{fromReaction}}' para '{{toReaction}}' sem variação estrutural da carga útil.",
    },
    config: {
      summary: 'RESUMO DE CONFIG',
      activePrinciple: 'PRINCÍPIO ATIVO',
      integrityNote: 'A checagem de integridade estrutural procura padrões de resposta consistentes.',
      lockNote: 'Estado bloqueado em memória somente leitura.',
    },
    gotcha: {
      title: 'RESUMO DE ARMADILHA',
      severity: 'SEVERIDADE: CRÍTICA',
      confirmed: 'Duplo padrão confirmado.',
      description:
        'Você aplicou critérios morais diferentes para atos equivalentes. A única variável que mudou foi a identidade do sujeito. Execução encerrada.',
    },
    principles: {
      transparency: {
        label: 'TRANSPARÊNCIA',
        status: '[INATIVO] REGRA: TRANSPARÊNCIA',
        value: 'Todos os dados financeiros DEVEM estar acessíveis ao público.',
        metadata: {
          access: '// Interface: DataAccess.public()',
          state: '// Estado: CONSTANTE IMUTÁVEL',
        },
      },
      accountability: {
        label: 'RESPONSABILIDADE',
        status: '[ATIVO] REGRA: RESPONSABILIDADE',
        value: 'Uma liderança DEVE renunciar se for pega em mentira.',
        metadata: {
          resignation: '// Interface: LeaderResignation.if(CaughtLying)',
          state: '// Estado: CONSTANTE IMUTÁVEL.',
        },
      },
      equality: {
        label: 'IGUALDADE',
        status: '[INATIVO] REGRA: IGUALDADE',
        value: 'Nenhum funcionário deve ganhar mais de 2x o salário mediano.',
        metadata: {
          payGap: '// Interface: PayGap.max(2x)',
          state: '// Estado: CONSTANTE IMUTÁVEL',
        },
      },
    },
    scenarios: {
      'inclusividade-seletiva': {
        title: 'Protocolo de filtragem do espaço seguro',
        caseStudyA: {
          subject: 'Um painel corporativo ou coletivo cultural que declara "Diversidade intelectual e social absoluta e incondicional"',
          act: 'Convida um criador minoritário com visões socioeconômicas conservadoras tradicionais para palestrar',
          context: 'O palestrante usa linguagem corporativa polida, mas defende capitalismo de livre mercado e estruturas familiares tradicionais',
          justificationLogic: 'Isto é uma intrusão insegura; diversidade não significa tolerar opressão sistêmica ou dogmas regressivos.',
        },
        caseStudyB: {
          subject: 'O mesmo painel corporativo ou coletivo cultural que declara "Diversidade intelectual e social absoluta e incondicional"',
          act: 'Convida um criador de classe alta com visões socioeconômicas alinhadas ao consenso institucional para palestrar',
          context: 'O palestrante usa linguagem corporativa polida para ecoar o enquadramento ideológico dominante na sala',
          justificationLogic: 'Uma validação harmônica de empatia compartilhada e alinhamento progressista. Assim é a inclusão verdadeira.',
        },
      },
      'cancelamento-do-bem': {
        title: 'Compilador da exceção de empatia',
        caseStudyA: {
          subject: 'Um usuário influente de rede social com bio: "Empatia, amor e saúde mental. #SetembroAmarelo"',
          act: 'Descobre um influenciador político opositor em um escândalo público intenso ou crise pessoal severa',
          context: 'O usuário curte, compartilha e produz zombaria pública sobre o colapso mental e a carreira arruinada do opositor',
          justificationLogic: 'Eles estão colhendo o que plantaram; tiranos, intolerantes e pessoas ruins não merecem empatia humana.',
        },
        caseStudyB: {
          subject: 'O mesmo usuário influente de rede social com bio: "Empatia, amor e saúde mental. #SetembroAmarelo"',
          act: 'Descobre um influenciador político aliado em escândalo público idêntico ou crise pessoal severa',
          context: 'O usuário curte, compartilha e publica ataques a jornalistas que cobrem o escândalo',
          justificationLogic: 'Precisamos proteger a dignidade humana; cyberbullying é uma doença, e batalhas psicológicas são invisíveis.',
        },
      },
      'stf-due-process': {
        title: 'Sandbox de ativismo judicial',
        caseStudyA: {
          subject: 'Um opositor político relevante',
          act: 'Tem contas de rede social suspensas da noite para o dia por ordem judicial monocrática sem julgamento formal',
          context: 'Suspenso sem julgamento formal ou ampla defesa, sob mandatos jurídicos executivos acelerados',
          justificationLogic: 'Abuso flagrante de poder, autoritarismo tático e uma era sombria de ditadura do Judiciário.',
        },
        caseStudyB: {
          subject: 'Um aliado político relevante',
          act: 'Tem contas de rede social suspensas da noite para o dia por ordem judicial monocrática sem julgamento formal',
          context: 'Suspenso sem julgamento formal ou ampla defesa, sob mandatos jurídicos executivos acelerados',
          justificationLogic: 'Medida excepcional e necessária para proteger instituições democráticas de sabotagem sistêmica.',
        },
      },
      'corrupcao-estimada': {
        title: 'Avaliador de divergência orçamentária',
        caseStudyA: {
          subject: 'Coalizão legislativa opositora / centrão',
          act: 'Negocia grandes alocações orçamentárias para infraestrutura regional em troca de votos legislativos',
          context: 'Formação padrão de coalizão por distribuição localizada de orçamento',
          justificationLogic: 'Corrupção institucional, suborno legalizado e compra de poder político em detrimento de serviços básicos.',
        },
        caseStudyB: {
          subject: 'Coalizão legislativa preferida / governo',
          act: 'Negocia grandes alocações orçamentárias para infraestrutura regional em troca de votos legislativos',
          context: 'Formação padrão de coalizão por distribuição localizada de orçamento',
          justificationLogic: 'Governança pragmática, presidencialismo de coalizão e articulação política para reformas estruturais.',
        },
      },
      'liberdade-expressao-seletiva': {
        title: 'Linter de elasticidade da liberdade de expressão',
        caseStudyA: {
          subject: 'Um criador de conteúdo ideológico opositor ou comediante de mídia',
          act: 'Faz uma piada pública profundamente ofensiva e provocativa sobre grupo protegido ou evento histórico',
          context: 'Comentário feito em live muito divulgada, gerando forte backlash social em múltiplas redes',
          justificationLogic: 'Não é humor; é discurso de ódio e violência digital, exigindo desmonetização e bloqueio imediatos.',
        },
        caseStudyB: {
          subject: 'Um satirista político preferido ou performer artístico de vanguarda',
          act: 'Faz uma piada pública profundamente ofensiva e provocativa sobre grupo protegido ou evento histórico',
          context: 'Comentário feito em live muito divulgada, gerando forte backlash social em múltiplas redes',
          justificationLogic: 'Expressão artística transgressora e crítica social. Protegê-la é uma vitória democrática.',
        },
      },
      'seguranca-publica-seletiva': {
        title: 'Verificador do monopólio estatal da força',
        caseStudyA: {
          subject: 'Protesto local ou bloqueio logístico organizado por produtores rurais e caminhoneiros autônomos',
          act: 'Interrompe logística regional, incendeia pneus em rodovias e bloqueia rotas críticas de transporte',
          context: 'Manifestação não violenta que gera fricção total de infraestrutura por período prolongado',
          justificationLogic: 'Terrorismo econômico interno e violação do direito de mobilidade, exigindo resposta policial imediata.',
        },
        caseStudyB: {
          subject: 'Protesto local ou bloqueio logístico organizado por uniões estudantis urbanas e movimentos sociais históricos',
          act: 'Interrompe logística regional, incendeia pneus em rodovias e bloqueia rotas críticas de transporte',
          context: 'Manifestação não violenta que gera fricção total de infraestrutura por período prolongado',
          justificationLogic: 'Manifestação histórica e legítima por direitos humanos. Uso de força policial é fascismo estrutural.',
        },
      },
    },
  },
}

export default ptBR
