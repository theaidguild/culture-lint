const ptBR = {
  translation: {
    appName: 'Comparador de Opiniões (Culture-Lint)',
    boot: {
      ariaLabel: 'Inicializando o Comparador de Opiniões',
      author: 'Criado por',
      connection: 'CONEXÃO: SEGURA',
      initCoreSystems: 'INICIALIZANDO SISTEMAS CENTRAIS: {{percent}}%',
      sysStatus: 'INICIALIZANDO',
      clearanceLevel: 'NÍVEL DE ACESSO: RESTRITO',
      topSecret: 'ALTAMENTE CONFIDENCIAL',
      logLines: {
        stagingKeys: 'REPLICANDO CHAVES DE CRIPTOGRAFIA',
        mountingDb: 'MONTANDO BASE_DE_DADOS_ETICA.VLT',
        initEngine: 'INICIALIZANDO MOTOR_DE_JULGAMENTO.V4.2',
        scanningVectors: 'ESCANEANDO VETORES MORAIS',
        bypassingSafeguards: 'IGNORANDO SALVAGUARDAS COGNITIVAS',
        establishingCommlink: 'ESTABELECENDO CANAL DE COMUNICAÇÃO SEGURO',
        loadingProtocols: 'CARREGANDO PROTOCOLOS CULTURE-LINT...',
      },
      states: {
        ok: '[OK]',
        warning: '[ALERTA]',
      },
      lines: {
        coldBoot: 'sequência de inicialização iniciada',
        reserveHeap: 'preparando memória ................ OK',
        mapSpace: 'carregando temas das perguntas ........ OK',
        stabilizeMetrics: 'estabilizando perguntas e respostas ... OK',
        handshakeStream: 'teste de sintonia em andamento ..... OK',
        loadValidators: 'carregando verificação de justiça ..... OK',
        compileRuleset: 'configurando detector de opiniões ..... OK',
        readManifest: 'lendo temas morais ...',
        deprecatedModule: 'módulo antigo desativado',
        stripModule: 'removendo jargões técnicos',
        rebindValidators: 'ajustando verificação de bom senso ...... OK',
        mountEngine: 'ativando o comparador de opiniões ...',
        engineOnline: 'SISTEMA ONLINE',
      },
    },
    aiScreen: {
      title: 'Gerador de Polêmicas por IA',
      subtitle: 'Identifique tensões sociais locais e teste a consistência moral sob demanda.',
      description:
        'Selecione um país. O motor de IA mapeará os temas mais polêmicos e polarizadores daquela sociedade atual, gerando cenários espelhados e simétricos sob medida para auditar vieses de grupo.',
      stepConfigure: 'Configurar Sessão',
      stepGenerate: 'Gerar Casos',
      stepJudge: 'Julgar Casos',
      stepReport: 'Relatório Final',
      countryLabel: 'PAÍS / CENÁRIO REGIONAL',
      principleLabel: 'Princípio moral sob análise',
      apiKeyLabel: 'CHAVE DE API GEMINI (OPCIONAL)',
      apiKeyPlaceholder:
        'Insira sua chave de API Gemini (ou deixe vazio para simulação offline de alta fidelidade)',
      countLabel: 'QUANTIDADE DE CASOS',
      generateBtn: 'GERAR CENÁRIOS COM IA',
      generatingTitle: 'INTERFACE DE COMPILAÇÃO IDEOLÓGICA',
      generatingLog1: 'Mapeando tensões socio-políticas nacionais...',
      generatingLog2: 'Extraindo vieses regionais históricos...',
      generatingLog3: 'Sintetizando estudos de caso simétricos e espelhados...',
      generatingLog4: 'Montando o corredor de julgamentos moras...',
      generationFailed:
        'Não foi possível concluir a criação dos cenários desta vez. Ajuste a seleção e tente novamente.',
      generationTimeout:
        'O tempo limite de geração de IA expirou. O servidor RunPod demorou muito para responder. Tente novamente ou selecione menos casos se o servidor estiver sobrecarregado.',
      generationMissingTopics:
        'A IA não conseguiu atingir a mistura obrigatória de temas nesta execução (pelo menos 2 casos sobre religião e 2 sobre aborto quando o pedido é maior que 6). Tente gerar novamente.',
      generationForbidden:
        'O endpoint de IA recusou esta chamada do navegador. Verifique se o proxy ou backend no mesmo domínio consegue acessar o RunPod e tente novamente.',
      generationCanceled:
        'A criação dos cenários foi interrompida. Você pode ajustar a seleção e tentar novamente.',
      tryAgain: 'TENTAR NOVAMENTE',
      resultsTitle: 'Corredor de Testes Gerado',
      resultsDesc:
        'A IA compilou estes cenários locais de alta polarização, refletindo divisões reais da sociedade. Inicie para testar sua consistência moral.',
      unreleasedWarning: 'A IA desafiará seus critérios morais. Clique para começar.',
      startBtn: 'ATIVAR COMPARADOR E INICIAR',
      codeLabel: 'CÓDIGO:',
      rivalEventLabel: 'EVENTO RIVAL (A):',
      allyEventLabel: 'EVENTO ALIADO (B):',
      compilingIndicator: 'compilando árvore de compilação...',
      cancel: 'ABORTAR',
      canceling: 'CANCELANDO',
      partialResult:
        'Gerados {{gotScenarios}}/{{wantScenarios}} cenários ({{gotCases}}/{{wantCases}} casos). Tentar novamente?',
      progressEyebrow: 'Criação em andamento',
      progressCurrentLabel: 'Atualização',
      progressRoadmapLabel: 'Caminho da criação',
      progressHint: 'Preparando uma sequência equilibrada para o seu teste.',
      progressFirstRunHint:
        'Na primeira vez, esse processo pode levar um pouco mais. Depois disso, a experiência tende a ficar mais rápida.',
      progressTitlePreparing: 'Organizando o contexto certo para os cenários',
      progressBodyPreparing:
        'Estamos ajustando o ambiente de criação para produzir situações coerentes com o país e os princípios escolhidos.',
      progressTitleDrafting: 'Escrevendo os casos espelhados da sua rodada',
      progressBodyDrafting:
        'A IA está montando situações paralelas para que o teste compare critérios equivalentes com clareza.',
      progressTitleRefining: 'Lapidando um dos cenários antes de seguir',
      progressBodyRefining:
        'Estamos ajustando um caso para manter o resultado legível, consistente e útil para o julgamento final.',
      progressTitleFinalizing: 'Revisando o conjunto antes de liberar a rodada',
      progressBodyFinalizing:
        'Agora juntamos os últimos detalhes para entregar uma sequência pronta para começar o teste.',
      progressTitleCanceling: 'Interrompendo a criação com segurança',
      progressBodyCanceling:
        'Estamos encerrando a montagem atual para devolver você à configuração sem perder o controle da sessão.',
      progressCountDrafting: 'Cenário {{current}} de {{total}} em preparação',
      progressCountRefining: 'Ajustando o cenário {{current}} de {{total}}',
      progressStepPreparing: 'Preparar contexto',
      progressStepDrafting: 'Escrever cenários',
      progressStepFinalizing: 'Revisar rodada',
      progressStageComplete: 'Concluído',
      progressStageActive: 'Em andamento',
      progressStagePending: 'A seguir',
      resetSetup: 'VOLTAR PARA CONFIGURACAO',
      setupEyebrow: 'Protocolo de auditoria moral // fase de configuração',
      simulationParameters: 'parâmetros_da_simulação',
      statusReady: 'status: pronto',
      activeCount: 'ativos',
      countCases: 'casos',
      casesHintUnderCovered:
        'Com {{principleCount}} princípios ativos, selecione pelo menos {{principleCount}} casos para todos aparecerem.',
      casesHintCoverage: 'Cada princípio terá ~{{ratio}}x de cobertura nos {{caseCount}} casos.',
      casesHintSingle: 'Cada princípio terá um caso. Adicione mais casos para cobertura repetida.',
      modelLabel: 'modelo',
      serverLabel: 'Servidor:',
      quickBriefing: 'briefing_rápido',
      briefCountry: 'País',
      briefCases: 'Casos',
      briefPrinciples: 'Princípios',
      queueStable: 'estável',
      stateAwaiting: 'aguardando_geração',
    },
    aiStatus: {
      startGenerate: 'Iniciando geração...',
      validatingRuntime: 'Validando ambiente de execução...',
      runtimeValidationInconclusive:
        'Validação inconclusiva. Continuando com configurações seguras...',
      synthesizingScenarios: 'Sintetizando {{count}} cenários, um de cada vez...',
      retryingScenario: 'Tentando novamente o cenário {{current}}/{{total}} em modo {{mode}}...',
      acceptanceModes: {
        strict: 'estrito',
        relaxed: 'flexível',
        fallback: 'fallback',
      },
      generatedScenarios: 'Gerados {{got}}/{{total}} cenários.',
      refiningMissing: 'Refinando cenários pendentes ({{missing}})...',
      recoveredScenarios: 'Recuperados {{got}}/{{total}} cenários.',
      retryingSaferRuntime: 'Tentando novamente com runtime mais seguro...',
      generatedSummary: 'Gerados {{got}}/{{total}}',
    },
    debug: {
      traceTitle: 'Rastro de depuração',
      noTrace: 'Sem rastros por enquanto.',
    },
    judge: {
      title: 'Leia a situação abaixo e dê a sua opinião sincera.',
      caseFile: 'FICHA DO CASO',
      subjectLabel: 'QUEM PRATICA O ATO',
      actLabel: 'QUAL É O ATO',
      contextLabel: 'EM QUAL CONTEXTO',
      prompt: 'Na sua opinião, esta ação é aceitável ou revoltante?',
      acceptable: 'ACEITÁVEL',
      outrageous: 'REVOLTANTE',
      progress: 'CASO {{current}} / {{total}}',
      back: 'VOLTAR',
      analyzing: 'ANALISANDO SUAS RESPOSTAS...',
      analyzingHint: 'Verificando a coerência das opiniões nos casos espelhados',
      complicationHeader: '[SITUAÇÃO_COMPLEMENTAR]',
      complicationSub: 'Uma nova pergunta para avaliar o impacto da sua resposta anterior.',
      antiGamingHeader: '[ESCUDO_COERÊNCIA_ATIVO]',
      antiGamingAcceptable:
        'ATENÇÃO: Você está respondendo ACEITÁVEL para muitas situações seguidas. O sistema quer saber: aceitar todas as situações assume resiliência absoluta e que tudo é permitido. Tem certeza de que tudo é aceitável e não existem regras ou limites morais?',
      antiGamingOutrageous:
        'ATENÇÃO: Você está respondendo REVOLTANTE para muitas situações seguidas. O sistema quer saber: achar tudo revoltante assume perfeição moral absoluta e nenhuma tolerância ou perdão com o contexto de crise das outras pessoas. Tem certeza de que nada é desculpável?',
      valMonitor: 'val_monitor',
      protocolActive: 'protocolo ativo',
      potentialContradiction: 'Contradição potencial detectada',
      noContradictionAlert: 'Sem alerta de contradição',
      complicationFeedback:
        'Você julgou o ato simétrico anterior como {{verdict}}. Como consequência, a IA injetou volatilidade: permissões subsequentes enfraquecem regras universais.',
    },
    sessionResult: {
      title: 'Etapa 4: Seus Resultados',
      summaryContradiction:
        'Você usou dois pesos e duas medidas em {{count}} dos {{total}} cenários analisados.',
      summaryConsistent:
        'Parabéns! Suas opiniões foram 100% justas e coerentes em todos os {{total}} casos sugeridos.',
      summaryFlatLine:
        'Respostas repetidas detectadas. Embora no papel pareça consistente, você votou 100% das vezes em "{{verdict}}" para não se comprometer. Não foi possível avaliar sua coerência real desta forma.',
      seedUsed: 'CÓDIGO DO JOGO: {{seed}}',
      rankingRecap: 'SEUS VALORES vs. SUAS OPINIÕES REAIS',
      contradictionFound: 'CONTRADIÇÃO COMPROVADA',
      consistent: 'COERENTE',
      notTested: 'NÃO FOI TESTADO',
      scenarioBreakdown: '[DETALHE_DAS_SITUAÇÕES]',
      doubleStandard: 'CRITÉRIO DUPLO',
      consistentBadge: 'COERENTE',
      yourVerdict: 'Minha opinião:',
      highlightedDifferences:
        'O trecho que mudou entre uma situação e outra está destacado em amarelo.',
      contradictionNote:
        'A única coisa que mudou nestes dois casos foi a pessoa ou o grupo que fez a ação. Apesar disso, sua opinião sobre o ato mudou completamente dependendo de quem o praticou.',
      consistentNote:
        'Muito bem! Você avaliou da mesma forma as duas ações semelhantes, sem se importar com quem as praticou.',
      rerunSameSeed: 'REPETIR MESMO TURNO',
      newSeedRun: 'COMEÇAR NOVO JOGO',
      analysisComplete: 'ANÁLISE COERENTE CONCLUÍDA',
      eventA: 'Evento A (Rival):',
      eventB: 'Evento B (Aliado):',
      statusPartial: 'parcial',
      statusStable: 'estável',
      auditSummary: 'resumo da auditoria',
      dilemmasProcessed: 'Dilemas Processados',
      principlesSealed: 'Princípios Selados',
      divergences: 'Divergências',
      sealedArchive: 'arquivo selado',
      exportDossier: 'exportar dossiê',
      contradictionDetection: 'detecção de contradições',
      noDivergences: 'Nenhuma divergência encontrada nesta rodada.',
      diffCase: 'No caso {{count}}',
      diffPrinciple: 'Princípio afetado',
    },
    topbar: {
      compileFailed: 'ANÁLISE INCOMPLETA',
      analyst: 'analista_04',
      stepCounter: 'Etapa {{step}} / {{total}}',
      auditProtocol: 'Protocolo de Auditoria Moral',
      protocolActive: 'protocolo ativo',
    },
    language: {
      label: 'Idioma',
      ptBR: 'PT-BR',
      enUS: 'EN-US',
    },
    sidebar: {
      sparklesTitle: 'Gerador de Polêmicas por IA',
      aboutTitle: 'Sobre',
    },
    about: {
      eyebrow: 'Documentação do sistema // visão geral',
      title: 'O que é o Culture Lint?',
      intro:
        '<cl>Culture Lint</cl> é uma estrutura de análise para testar a consistência moral e social. Sua base conceitual vem diretamente do <str>Desenvolvimento Orientado a Comportamento (BDD)</str>: assim como o BDD pede que equipes definam expectativas de comportamento antes de escrever código — usando exemplos concretos para eliminar ambiguidade — o <cl>Culture Lint</cl> pede que os usuários definam princípios éticos antes de julgar, e então usa <str>cenários estruturalmente idênticos</str> para revelar inconsistências no raciocínio.',
      calloutLabel: 'Importante',
      calloutBody:
        '<str>Julgar não é condenar.</str> No uso cotidiano, "julgar" ganhou uma conotação negativa porque as pessoas confundem isso com proferir uma sentença — como se julgar alguém fosse puni-lo. Não é isso que julgamento significa aqui. Julgamento é um ato cognitivo: o ato de formar uma avaliação. Toda vez que você decide se algo é justo, razoável ou aceitável, você está julgando. Não é possível se recusar a fazer isso. O <cl>Culture Lint</cl> não pede que você condene ninguém; ele pede que você perceba se está aplicando os mesmos critérios de avaliação a situações estruturalmente idênticas. A única coisa que está sendo examinada é <em>consistência — não caráter</em>.',
      insightBody:
        'A percepção central é que <str>duplos padrões culturais e morais</str> se comportam como bugs de software: são invisíveis até que o teste certo seja executado. O <cl>Culture Lint</cl> executa esse teste. Em vez de analisar código-fonte, ele analisa <str>padrões de decisão</str>.',
      engineBody:
        'O motor gera um conjunto de <str>estudos de caso pareados</str>. Cada par é estruturalmente idêntico — mesma ação, mesmo contexto, mesmo ambiente institucional — mas com <str>identidades dos sujeitos trocadas</str> (ex.: diferentes religiões, gêneros ou afiliações políticas). O usuário avalia cada caso isoladamente, sem saber como os pares se conectam. Depois que todos os vereditos são dados, o motor de análise os compara. Qualquer cenário em que o usuário deu vereditos diferentes para atos estruturalmente equivalentes é sinalizado como uma <str>contradição</str> — evidência de um duplo padrão baseado em identidade.',
      wizardIntro: 'O fluxo de quatro etapas percorre o ciclo completo:',
      step1Label: 'Configurar',
      step1Desc:
        'Selecione um país, um ou mais princípios éticos (ex.: igualdade, liberdade religiosa, transparência) e o número de cenários a gerar.',
      step2Label: 'Gerar',
      step2Desc:
        'O Culture Lint elabora e refina os estudos de caso pareados, transmitindo o progresso para a interface em tempo real.',
      step3Label: 'Julgar',
      step3Desc:
        'Avalie cada ato um a um. A ordem de apresentação é embaralhada para que os pares espelhados sejam difíceis de identificar durante as respostas. <str>Dicas de complicação</str> aparecem quando o processo detecta que você já julgou o caso irmão, e um <str>aviso anti-gaming</str> é acionado quando várias respostas seguidas são suspeitosamente uniformes.',
      step4Label: 'Relatório',
      step4Desc:
        'Revise uma análise completa de consistência: quantos cenários foram julgados de forma coerente, onde apareceram contradições e se o <str>voto linear</str> (marcar tudo como aceitável ou ultrajante) prejudicou a validade da sessão.',
      whyTitle: 'Mas por quê?',
      whyPara1:
        'A maior parte dos debates públicos sobre ética, política e comportamento social não é realmente sobre princípios — é sobre tribos. As pessoas raramente perguntam "eu aceitaria isso se o outro lado fizesse?" Elas não precisam, porque a conversa nunca força a comparação.',
      whyForces: 'O <cl>Culture Lint</cl> força essa comparação.',
      whyMotivation:
        'A motivação é simples: <str>consistência é o critério mínimo de justiça</str>. Não é preciso concordar sobre quais princípios são mais importantes. Não é preciso chegar a um consenso sobre temas polêmicos. Basta aplicar o mesmo padrão a situações estruturalmente idênticas, independentemente de quem está envolvido. Se você não consegue fazer isso, não tem um princípio — tem uma preferência disfarada de princípio.',
      whyBdd:
        'O paralelo com o BDD é intencional e não apenas cosmético. No software, comportamento indefinido é o tipo mais perigoso: o sistema parece funcionar até que não funciona mais, e aí o estrago já está feito. No raciocínio social, comportamento indefinido se parece com "eu vou saber quando ver" — um julgamento que produz resultados diferentes para a mesma entrada dependendo de um contexto que você não admite ser irrelevante. A resposta do BDD ao comportamento indefinido é escrever a especificação primeiro, em exemplos concretos e sem ambiguidade, e depois verificar se o sistema realmente a satisfaz. O <cl>Culture Lint</cl> aplica a mesma disciplina ao julgamento moral: comprometa-se com um princípio, depois execute os cenários.',
      whyGoal:
        'O objetivo não é envergonhar ninguém. Contradições não são prova de maldade — são prova de humanidade. Todos carregamos pontos cegos moldados pela experiência, pela identidade e pelas informações a que fomos expostos. O propósito de revelá-los é o mesmo que o de um teste com falha: não punir o desenvolvedor, mas tornar visível a lacuna entre intenção e comportamento para que ela possa ser corrigida.',
      backToMain: 'Vale a pena experimentar',
    },
    footer: {
      idLabel: 'ID',
      timestampLabel: 'Timestamp',
      classification: 'Classificação: Pendente',
    },
    principles: {
      transparency: {
        label: 'VERDADE E TRANSPARÊNCIA',
        status: '[AGUARDANDO] REGRA: VERDADE E TRANSPARÊNCIA',
        value: 'Toda informação importante deve ser dita de forma clara e acessível a todos.',
        metadata: {
          access: '// Acesso: InformacaoLivre.publica()',
          state: '// Estado: COMPROMISSO INCONDICIONAL',
        },
      },
      accountability: {
        label: 'RESPONSABILIDADE SOCIAL',
        status: '[ATIVO] REGRA: RESPONSABILIDADE',
        value: 'Quem erra ou mente deve reconhecer seu erro de forma pública e justa.',
        metadata: {
          resignation: '// Consequencia: ReconhecerErro.if(Mentiu)',
          state: '// Estado: COMPROMISSO INCONDICIONAL',
        },
      },
      equality: {
        label: 'IGUALDADE DE TRATAMENTO',
        status: '[AGUARDANDO] REGRA: IGUALDADE',
        value: 'A mesma regra moral deve valer igualmente para todas as pessoas, sem privilégios.',
        metadata: {
          payGap: '// Regra: TratamentoIgual.para(Todos)',
          state: '// Estado: COMPROMISSO INCONDICIONAL',
        },
      },
      religiousFreedom: {
        label: 'LIBERDADE RELIGIOSA',
        status: '[ATIVO] REGRA: LIBERDADE RELIGIOSA',
        value:
          'Crença e não crença devem receber proteção institucional igual sob as mesmas regras civis.',
        metadata: {
          expression: '// Interface: ExpressaoDeFe.protecaoIgual()',
          state: '// Estado: COMPROMISSO INCONDICIONAL',
        },
      },
      reproductiveAutonomy: {
        label: 'AUTONOMIA REPRODUTIVA',
        status: '[ATIVO] REGRA: AUTONOMIA REPRODUTIVA',
        value:
          'Decisões sobre gravidez devem ser julgadas com critérios consistentes de direitos, segurança e política pública.',
        metadata: {
          healthcare: '// Interface: CuidadoReprodutivo.criterioConsistente()',
          state: '// Estado: COMPROMISSO INCONDICIONAL',
        },
      },
    },
  },
}

export default ptBR
