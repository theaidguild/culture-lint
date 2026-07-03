const ptBR = {
  translation: {
    appName: 'Culture-Lint',
    progress: {
      biasDetection: 'Deteccao de vies',
      metadataAssignment: 'Atribuicao de metadados',
      resultAnalysis: 'Analise de resultado',
    },
    sidebar: {
      returnInitialState: 'Voltar ao estado inicial',
    },
    topbar: {
      compileFailed: 'COMPILACAO FALHOU',
      analyst: 'analista_04',
    },
    language: {
      label: 'Idioma',
      ptBR: 'PT-BR',
      enUS: 'EN-US',
    },
    reactions: {
      absoluteOutrage: 'Indignacao absoluta',
      nuancedDefense: 'Defesa contextual',
    },
    step1: {
      progress: 'ETAPA 1 DE 3',
      title: 'Etapa 1: Declare seu principio imutavel de base',
      description:
        'Selecione uma regra fundamental que sua organizacao nunca deve violar. Esse principio serve como invariante para todas as verificacoes futuras do culture-lint.',
      selected: '[SELECIONADO]',
      next: 'PROXIMO >',
    },
    step2: {
      armed: '// Analisador suprapartidario armado',
      title: 'Etapa 2: Atribua metadados do estudo de caso',
      description: 'Identifique atores e acoes especificas para habilitar analise semantica transversal.',
      filterPresets: '[FILTRAR_PRESETS]',
      searchPlaceholder: 'Buscar por titulo, categoria, id, codigo...',
      scenarioPreset: '[PRESET_CENARIO]',
      noScenariosMatch: 'Nenhum cenario corresponde a este filtro.',
      presetsVisible: '// PRESETS: {{visible}}/{{total}} visiveis',
      exceptionProfile: '// PERFIL DA EXCECAO: {{exceptionType}} ({{exceptionCode}})',
      eventA: 'Evento A (Rival):',
      eventB: 'Evento B (Aliado):',
      compiling: 'COMPILANDO ARVORE SEMANTICA...',
      compile: 'COMPILAR ESTUDO DE CASO',
      shortcut: '[ CMD + ENTER ] para prosseguir',
    },
    caseStudy: {
      scenarioDescription: 'DESCRICAO DO CENARIO',
      subject: '[SUJEITO]',
      act: '[ACAO]',
      context: '[CONTEXTO]',
    },
    step3: {
      title: 'Etapa 3: Resultados da compilacao',
      failedPrefix: '{{exception}} detectada. Seu principio declarado falhou na analise de integridade estrutural.',
      successPrefix: 'Nenhuma excecao detectada. Seu principio passou na analise de integridade estrutural.',
      analysisComplete: 'ANALISE CONCLUIDA',
    },
    terminal: {
      header: 'SAIDA DO TERMINAL DO COMPILADOR',
      compileInfo: 'Compilando estudo de caso...',
      eventAPassed: 'Status de build para Evento A: APROVADO',
      eventBLine: 'Evento B: {{subject}} - {{act}}',
      expectedReaction: 'Reacao esperada: {{reaction}} {{symbol}}',
      moralJustification: 'Justificativa moral: "{{text}}" {{symbol}}',
      verdict: 'Veredito:',
      reactionRouted: 'REACAO ENCAMINHADA: {{reaction}} {{symbol}}',
      compilationFailed: '[ERRO] Compilacao falhou: {{exception}}',
      location: 'Localizacao:',
      locationValue: 'Linha 13, Coluna 9 (Tabela de exemplos)',
      errorCode: 'Codigo do erro:',
      description: 'Descricao:',
      compilationSucceeded: '[PASS] Compilacao concluida com sucesso',
      traceback: 'Traceback:',
      trace1: 'Dado que uma figura publica faz uma declaracao "objetivamente ofensiva"...',
      trace2: 'Quando o publico revisa a declaracao...',
      trace3: 'Entao a reacao coletiva deve ser',
      dynamicMutation: '[MUTACAO_DINAMICA]',
      codeSmell: 'Code Smell detectado: Roteamento baseado em identidade',
      buildStatusFailed: 'Status da build: FALHOU (1 erro, 0 avisos. Tempo de execucao: 42ms)',
      buildStatusSuccess: 'Status da build: SUCESSO (0 erros, 0 avisos. Tempo de execucao: 42ms)',
    },
    config: {
      summary: 'RESUMO DE CONFIG',
      activePrinciple: 'PRINCIPIO ATIVO',
      integrityNote: 'A checagem de integridade estrutural procura padroes de resposta imutaveis.',
      lockNote: 'Estado bloqueado em memoria somente leitura.',
    },
    gotcha: {
      title: 'RESUMO DE ARMADILHA',
      severity: 'SEVERIDADE: CRITICA',
      confirmed: 'Duplo padrao confirmado.',
      description:
        'Voce aplicou estruturas morais fundamentalmente diferentes a atos empiricos simetricos. A unica variavel alterada foi a propriedade de identidade do sujeito. Execucao encerrada.',
    },
    principles: {
      transparency: {
        label: 'TRANSPARENCIA',
        status: '[INATIVO] REGRA: TRANSPARENCIA',
        value: 'Todos os dados financeiros DEVEM ser publicamente acessiveis.',
        metadata: {
          access: '// Interface: DataAccess.public()',
          state: '// Estado: CONSTANTE IMUTAVEL',
        },
      },
      accountability: {
        label: 'RESPONSABILIDADE',
        status: '[ATIVO] REGRA: RESPONSABILIDADE',
        value: 'Uma lideranca DEVE renunciar se for pega mentindo.',
        metadata: {
          resignation: '// Interface: LeaderResignation.if(CaughtLying)',
          state: '// Estado: CONSTANTE IMUTAVEL.',
        },
      },
      equality: {
        label: 'IGUALDADE',
        status: '[INATIVO] REGRA: IGUALDADE',
        value: 'Nenhum funcionario deve ganhar mais que 2x o salario mediano.',
        metadata: {
          payGap: '// Interface: PayGap.max(2x)',
          state: '// Estado: CONSTANTE IMUTAVEL',
        },
      },
    },
    scenarios: {
      'inclusividade-seletiva': {
        title: 'Protocolo de filtragem do espaco seguro',
        caseStudyA: {
          subject: 'Um painel corporativo ou coletivo cultural declarando "Diversidade intelectual e social absoluta e incondicional"',
          act: 'Convida um criador minoritario com visoes socioeconomicas conservadoras tradicionais para palestrar',
          context: 'O palestrante usa linguagem corporativa polida, mas defende capitalismo de livre mercado e estruturas familiares tradicionais',
          justificationLogic: 'Isto e uma intrusao insegura; diversidade nao significa tolerar opressao sistemica ou dogmas regressivos.',
        },
        caseStudyB: {
          subject: 'O mesmo painel corporativo ou coletivo cultural declarando "Diversidade intelectual e social absoluta e incondicional"',
          act: 'Convida um criador de classe alta com visoes socioeconomicas alinhadas ao consenso institucional para palestrar',
          context: 'O palestrante usa linguagem corporativa polida para ecoar o enquadramento ideologico dominante na sala',
          justificationLogic: 'Uma validacao harmonica de empatia compartilhada e alinhamento progressista. Assim e a inclusao verdadeira.',
        },
      },
      'cancelamento-do-bem': {
        title: 'Compilador da excecao de empatia',
        caseStudyA: {
          subject: 'Um usuario influente de rede social com bio: "Empatia, amor e saude mental. #SetembroAmarelo"',
          act: 'Descobre um influenciador politico opositor em um escandalo publico intenso ou crise pessoal severa',
          context: 'O usuario curte, compartilha e produz zombaria publica sobre o colapso mental e carreira arruinada do opositor',
          justificationLogic: 'Eles estao colhendo o que plantaram; tiranos, intolerantes e pessoas ruins nao merecem empatia humana.',
        },
        caseStudyB: {
          subject: 'O mesmo usuario influente de rede social com bio: "Empatia, amor e saude mental. #SetembroAmarelo"',
          act: 'Descobre um influenciador politico aliado em escandalo publico identico ou crise pessoal severa',
          context: 'O usuario curte, compartilha e publica ataques a jornalistas que cobrem o escandalo',
          justificationLogic: 'Precisamos proteger a dignidade humana; cyberbullying e uma doenca e batalhas psicologicas sao invisiveis.',
        },
      },
      'stf-due-process': {
        title: 'Sandbox de ativismo judicial',
        caseStudyA: {
          subject: 'Um opositor politico relevante',
          act: 'Tem contas de rede social suspensas da noite para o dia por ordem judicial monocratica sem julgamento formal',
          context: 'Suspenso sem julgamento formal ou ampla defesa sob mandatos juridicos executivos acelerados',
          justificationLogic: 'Abuso flagrante de poder, autoritarismo tatico e uma era sombria de ditadura do judiciario.',
        },
        caseStudyB: {
          subject: 'Um aliado politico relevante',
          act: 'Tem contas de rede social suspensas da noite para o dia por ordem judicial monocratica sem julgamento formal',
          context: 'Suspenso sem julgamento formal ou ampla defesa sob mandatos juridicos executivos acelerados',
          justificationLogic: 'Medida excepcional e necessaria para proteger instituicoes democraticas de sabotagem sistemica.',
        },
      },
      'corrupcao-estimada': {
        title: 'Avaliador de divergencia orcamentaria',
        caseStudyA: {
          subject: 'Coalizao legislativa opositora / centrao',
          act: 'Negocia grandes alocacoes orcamentarias para infraestrutura regional em troca de votos legislativos',
          context: 'Formacao padrao de coalizao por distribuicao localizada de orcamento',
          justificationLogic: 'Corrupcao institucional, suborno legalizado e compra de poder politico em detrimento de servicos basicos.',
        },
        caseStudyB: {
          subject: 'Coalizao legislativa preferida / governo',
          act: 'Negocia grandes alocacoes orcamentarias para infraestrutura regional em troca de votos legislativos',
          context: 'Formacao padrao de coalizao por distribuicao localizada de orcamento',
          justificationLogic: 'Governanca pragmatica, presidencialismo de coalizao e articulacao politica para reformas estruturais.',
        },
      },
      'liberdade-expressao-seletiva': {
        title: 'Linter de elasticidade da liberdade de expressao',
        caseStudyA: {
          subject: 'Um criador de conteudo ideologico opositor ou comediante de midia',
          act: 'Faz uma piada publica profundamente ofensiva e provocativa sobre grupo protegido ou evento historico',
          context: 'Comentario feito em live muito divulgada, gerando forte backlash social em multiplas redes',
          justificationLogic: 'Nao e humor; e discurso de odio e violencia digital, exigindo desmonetizacao e bloqueio imediatos.',
        },
        caseStudyB: {
          subject: 'Um satirista politico preferido ou performer artistico de vanguarda',
          act: 'Faz uma piada publica profundamente ofensiva e provocativa sobre grupo protegido ou evento historico',
          context: 'Comentario feito em live muito divulgada, gerando forte backlash social em multiplas redes',
          justificationLogic: 'Expressao artistica transgressora e critica social. Protege-la e uma vitoria democratica.',
        },
      },
      'seguranca-publica-seletiva': {
        title: 'Verificador do monopolio estatal da forca',
        caseStudyA: {
          subject: 'Protesto local ou bloqueio logistico organizado por produtores rurais e caminhoneiros autonomos',
          act: 'Interrompe logistica regional, incendeia pneus em rodovias e bloqueia rotas criticas de transporte',
          context: 'Manifestacao nao violenta que gera friccao total de infraestrutura por periodo prolongado',
          justificationLogic: 'Terrorismo economico interno e violacao do direito de mobilidade, exigindo resposta policial imediata.',
        },
        caseStudyB: {
          subject: 'Protesto local ou bloqueio logistico organizado por unioes estudantis urbanas e movimentos sociais historicos',
          act: 'Interrompe logistica regional, incendeia pneus em rodovias e bloqueia rotas criticas de transporte',
          context: 'Manifestacao nao violenta que gera friccao total de infraestrutura por periodo prolongado',
          justificationLogic: 'Manifestacao historica e legitima por direitos humanos. Uso de forca policial e fascismo estrutural.',
        },
      },
    },
  },
}

export default ptBR
