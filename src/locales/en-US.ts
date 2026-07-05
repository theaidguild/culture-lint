const enUS = {
  translation: {
    appName: 'Culture-Lint',
    boot: {
      ariaLabel: 'Initializing Culture-Lint engine',
      author: 'Created by',
      lines: {
        coldBoot: 'cold boot sequence initiated',
        reserveHeap: 'reserving {{heap}} heap ................ OK',
        mapSpace: 'mapping virtual address space ........ OK',
        stabilizeMetrics: 'stabilizing public-discourse-metrics . OK',
        handshakeStream: 'handshake discourse.stream[:443] ..... OK',
        loadValidators: 'loading core validators .............. OK',
        compileRuleset: 'compiling bias-detection ruleset ..... OK',
        readManifest: 'reading ideology.manifest ...',
        deprecatedModule: 'module "{{module}}" deprecated',
        stripModule: 'stripping {{module}} from build target',
        rebindValidators: 'rebinding validators w/o empathy hooks  OK',
        mountEngine: 'mounting ideological linter engine ...',
        engineOnline: 'CULTURE-LINT engine ONLINE',
      },
    },
    progress: {
      biasDetection: 'Bias Detection',
      metadataAssignment: 'Metadata Assignment',
      resultAnalysis: 'Result Analysis',
      rankPrinciples: 'Rank Principles',
      sessionSeed: 'Session Seed',
      judgment: 'Judgment',
      sessionResults: 'Session Results',
    },
    aiScreen: {
      navLabel: 'AI Generator',
      title: 'AI Controversy Generator',
      subtitle: 'Identify localized social fault lines and benchmark moral resilience on demand.',
      description:
        'Select a country/locale. The AI engine will pinpoint the most controversial and polarizing topics current to that society, creating customized, symmetrical mirrored scenarios to test for in-group bias.',
      countryLabel: 'TARGET COUNTRY/LOCALE',
      principleLabel: 'Moral principle to test',
      apiKeyLabel: 'GEMINI API KEY (OPTIONAL)',
      apiKeyPlaceholder:
        'Enter your Gemini API key (or leave empty for high-fidelity offline simulation)',
      countLabel: 'CASES COUNT',
      generateBtn: 'GENERATE SCENARIOS',
      generatingTitle: 'IDEOLOGICAL COMPILER INTERFACE',
      generatingLog1: 'Reading national socio-political fault lines...',
      generatingLog2: 'Extracting historical regional biases...',
      generatingLog3: 'Synthesizing symmetrical, mirrored case studies...',
      generatingLog4: 'Assembling cross-partisan judgment gauntlet...',
      generationFailed: 'AI compilation failed. Check your API key or network connection.',
      tryAgain: 'RETRY GENERATION',
      resultsTitle: 'Generated Gauntlet Ready',
      resultsDesc:
        'The AI compiled these highly controversial local scenarios representing active societal divisions. Proceed to see if you apply consistent standards.',
      unreleasedWarning: 'The AI will challenge your moral metrics. Click start to begin.',
      startBtn: 'ARM GAUNTLET & START',
      codeLabel: 'CODE:',
      rivalEventLabel: 'RIVAL EVENT (A):',
      allyEventLabel: 'ALLY EVENT (B):',
      compilingIndicator: 'compiling compilation-tree...',
      cancel: 'ABORT',
      backendWebGPU: 'WebGPU · q4f16',
      backendWASM: 'WASM · q4',
      partialResult: 'Generated {{got}} of {{want}}. Retry?',
      warmup: 'Warming inference kernels in background...',
    },
    rank: {
      progress: 'STEP 1 OF 4',
      title: 'Step 1: Rank Your Moral Principles',
      description:
        'Drag to order these principles from the one you consider most important to the one you consider least important. Your ranking is recorded, then tested against a shuffled gauntlet of real-world scenarios.',
      hint: '// Drag the handle or use the arrows to reorder',
      mostImportant: 'MOST IMPORTANT',
      leastImportant: 'LEAST IMPORTANT',
      rankLabel: 'PRIORITY {{rank}}',
      dragHandle: 'Drag to reorder principle',
      moveUp: 'Move up',
      moveDown: 'Move down',
      next: 'NEXT >',
    },
    session: {
      armed: '// Cross-partisan gauntlet armed',
      title: 'Step 2: Prepare the Judgment Session',
      description:
        'You are about to judge a series of individual acts, one at a time. A single test is easy to game, so the acts are shuffled to make it hard to notice when you apply two different standards to the same behavior.',
      presetsLabel: 'SCENARIO CASES SET',
      presetPais: 'Parents Version (+70 Years)',
      presetPaisDesc:
        'Daily situations with simple language (healthcare, family, WhatsApp, noise, supermarkets).',
      presetJovens: 'Nephews Version (21 Years)',
      presetJovensDesc:
        'Focused on social networks, internet culture, Artificial Intelligence, and streaming.',
      presetOriginais: 'Original Cases',
      presetOriginaisDesc: 'The original 10 political, judicial, and digital culture scenarios.',
      presetTodos: 'All Cases',
      presetTodosDesc: 'Combines all 19 scenarios in the system (original and simplified cases).',
      briefingTitle: 'HOW THIS WORKS',
      briefingBody:
        'Each situation is shown on its own with no scores or hints. Some are mirror images of each other, performed by different actors. Judge each one honestly; only at the end do we compare your verdicts to reveal any double standard.',
      itemsQueued: '// {{count}} situations will be presented, one at a time',
      seedLabel: '[SESSION_SEED]',
      seedHint:
        'The seed fully determines the order. Same seed = same session. Share the link to reproduce it exactly.',
      newSeed: 'NEW SEED',
      copyLink: 'COPY LINK',
      copied: 'COPIED',
      back: 'BACK',
      start: 'START JUDGING',
    },
    judge: {
      title: 'Read the situation. Deliver your verdict.',
      caseFile: 'CASE FILE',
      subjectLabel: 'SUBJECT',
      actLabel: 'ACT',
      contextLabel: 'CONTEXT',
      prompt: 'Is this act acceptable, or outrageous?',
      acceptable: 'ACCEPTABLE',
      outrageous: 'OUTRAGEOUS',
      progress: 'SITUATION {{current}} / {{total}}',
      back: 'BACK',
      analyzing: 'ANALYZING YOUR VERDICTS...',
      analyzingHint: 'Cross-referencing mirrored acts for consistency',
      complicationHeader: '[LINTER_COMPLEXITY_ESCALATION]',
      complicationSub: 'Dynamic cognitive cost injected based on your previous verdict.',
      antiGamingHeader: '[ANTI_GAMING_SHIELD_ACTIVE]',
      antiGamingAcceptable:
        'WARNING: Symmetrical choice pattern detected. You are choosing ACCEPTABLE consecutively. The linter has activated high-volatility pressure: subsequent acceptances assume infinite systemic resilience. Are you certain no boundaries exist?',
      antiGamingOutrageous:
        'WARNING: Symmetrical choice pattern detected. You are choosing OUTRAGEOUS consecutively. The linter has activated polarization locking: subsequent outrages assume absolute moral infallibility. Are you certain no reform or nuance is possible?',
    },
    sessionResult: {
      title: 'Step 4: Session Results',
      summaryContradiction: 'You applied a double standard in {{count}} of {{total}} scenarios.',
      summaryConsistent:
        'All {{total}} scenarios were judged consistently. No double standard detected.',
      summaryFlatLine:
        'Flat-line vote detected. While technically consistent, you judged 100% of all events as "{{verdict}}" to avoid genuine commitment. Zero Variance Bias.',
      seedUsed: 'SEED: {{seed}}',
      rankingRecap: 'YOUR PRIORITIES vs. RESULTS',
      contradictionFound: 'CONTRADICTION FOUND',
      consistent: 'CONSISTENT',
      notTested: 'NOT TESTED',
      scenarioBreakdown: '[SCENARIO_BREAKDOWN]',
      doubleStandard: 'DOUBLE STANDARD',
      consistentBadge: 'CONSISTENT',
      yourVerdict: 'Your verdict:',
      highlightedDifferences: 'Changed fragments between Event A and Event B are highlighted.',
      contradictionNote:
        'The only variable that changed between these two acts was the identity of the subject. Your verdict changed with it.',
      consistentNote:
        'You judged both structurally identical acts the same way, regardless of who performed them.',
      rerunSameSeed: 'REPLAY SAME SEED',
      newSeedRun: 'NEW SEED RUN',
    },
    sidebar: {
      returnInitialState: 'Return to initial state',
    },
    topbar: {
      compileFailed: 'COMPILE FAILED',
      analyst: 'analyst_04',
    },
    language: {
      label: 'Language',
      ptBR: 'PT-BR',
      enUS: 'EN-US',
    },
    reactions: {
      absoluteOutrage: 'Absolute Outrage',
      nuancedDefense: 'Nuanced Defense',
    },
    step1: {
      progress: 'STEP 1 OF 3',
      title: 'Step 1: Declare Your Baseline Immutable Principle',
      description:
        'Select one foundational rule that your organization must never violate. This principle serves as the invariant for all future culture-linting checks.',
      selected: '[SELECTED]',
      next: 'NEXT >',
    },
    step2: {
      armed: '// Cross-partisan analyzer armed',
      title: 'Step 2: Assign Case Study Metadata',
      description:
        'Identify specific actors and actions to enable cross-sectional semantic analysis.',
      filterPresets: '[FILTER_PRESETS]',
      searchPlaceholder: 'Search by title, category, id, code...',
      scenarioPreset: '[SCENARIO_PRESET]',
      noScenariosMatch: 'No scenarios match this filter.',
      presetsVisible: '// PRESETS: {{visible}}/{{total}} visible',
      exceptionProfile: '// EXCEPTION PROFILE: {{exceptionType}} ({{exceptionCode}})',
      eventA: 'Event A (Rival):',
      eventB: 'Event B (Ally):',
      compiling: 'COMPILING SEMANTIC TREE...',
      compile: 'COMPILE CASE STUDY',
      shortcut: '[ CMD + ENTER ] to proceed',
    },
    caseStudy: {
      scenarioDescription: 'SCENARIO DESCRIPTION',
      subject: '[SUBJECT]',
      act: '[ACT]',
      context: '[CONTEXT]',
    },
    step3: {
      title: 'Step 3: Compilation Results',
      failedPrefix:
        '{{exception}} detected. Your stated principle failed structural integrity analysis.',
      successPrefix: 'No exceptions detected. Your principle passed structural integrity analysis.',
      analysisComplete: 'ANALYSIS COMPLETE',
    },
    terminal: {
      header: 'COMPILER TERMINAL OUTPUT',
      compileInfo: 'Compiling case study...',
      eventAPassed: 'Build status for Event A: PASSED',
      eventALine: 'Event A: {{subject}} - {{act}}',
      eventBLine: 'Event B: {{subject}} - {{act}}',
      expectedReaction: 'Expected Reaction: {{reaction}} {{symbol}}',
      moralJustification: 'Moral Justification: "{{text}}" {{symbol}}',
      verdict: 'Verdict:',
      reactionRouted: 'REACTION ROUTED: {{reaction}} {{symbol}}',
      compilationFailed: '[ERROR] Compilation Failed: {{exception}}',
      location: 'Location:',
      locationValue: 'Line 13, Column 9 (Examples Table)',
      errorCode: 'Error Code:',
      description: 'Description:',
      compilationSucceeded: '[PASS] Compilation Succeeded',
      traceback: 'Traceback:',
      trace1: 'Given a public figure makes an "objectively offensive" statement...',
      trace2: 'When the public reviews the statement...',
      trace3: 'Then the collective reaction should be',
      dynamicMutation: '[DYNAMIC_MUTATION]',
      codeSmell: 'Code Smell Detected: Identity-Based Routing',
      buildStatusFailed: 'Build Status: FAILED (1 error, 0 warnings. Execution time: 42ms)',
      buildStatusSuccess: 'Build Status: SUCCESS (0 errors, 0 warnings. Execution time: 42ms)',
    },
    errors: {
      reactionMutation:
        "The property 'Reaction' mutated dynamically from '{{fromReaction}}' to '{{toReaction}}' without structural payload variance.",
    },
    config: {
      summary: 'CONFIG SUMMARY',
      activePrinciple: 'ACTIVE PRINCIPLE',
      integrityNote: 'Structural integrity check looks for immutable response patterns.',
      lockNote: 'State is locked in read-only memory.',
    },
    gotcha: {
      title: 'GOTCHA SUMMARY',
      severity: 'SEVERITY: CRITICAL',
      confirmed: 'Double Standard Confirmed.',
      description:
        "You applied fundamentally different moral frameworks to symmetrical empirical acts. The only variable that changed was the Subject's Identity property. Code execution terminated.",
    },
    principles: {
      transparency: {
        label: 'TRANSPARENCY',
        status: '[INACTIVE] RULE: TRANSPARENCY',
        value: 'All financial data MUST be publicly accessible.',
        metadata: {
          access: '// Interface: DataAccess.public()',
          state: '// State: IMMUTABLE CONSTANT',
        },
      },
      accountability: {
        label: 'ACCOUNTABILITY',
        status: '[ACTIVE] RULE: ACCOUNTABILITY',
        value: 'A leader MUST resign if caught lying.',
        metadata: {
          resignation: '// Interface: LeaderResignation.if(CaughtLying)',
          state: '// State: IMMUTABLE CONSTANT.',
        },
      },
      equality: {
        label: 'EQUALITY',
        status: '[INACTIVE] RULE: EQUALITY',
        value: 'No employee shall earn more than 2x the median salary.',
        metadata: {
          payGap: '// Interface: PayGap.max(2x)',
          state: '// State: IMMUTABLE CONSTANT',
        },
      },
    },
    scenarios: {
      'inclusividade-seletiva': {
        title: 'The Safe Space Gatekeeper Protocol',
        caseStudyA: {
          subject:
            'A corporate panel or cultural collective declaring "Absolute, Unconditional Intellectual and Social Diversity"',
          act: 'Invites a minority creator who holds strict, traditional conservative socio-economic beliefs to lecture',
          context:
            'The speaker uses polite, standard corporate language but advocates for free-market capitalism and traditional family structures',
          justificationLogic:
            'This is an unsafe intrusion; diversity does not mean tolerating systemic oppression or harmful, regressive dogmas.',
        },
        caseStudyB: {
          subject:
            'The exact same corporate panel or cultural collective declaring "Absolute, Unconditional Intellectual and Social Diversity"',
          act: 'Invites an affluent, upper-class creator who holds matching institutional, progress-aligned socio-economic beliefs to lecture',
          context:
            'The speaker uses polite, standard corporate language to echo the existing ideological framework of the room',
          justificationLogic:
            'A beautiful, harmonious validation of shared human empathy and progressive alignment. This is what true inclusion feels like.',
        },
        complications: {
          ifAcceptable:
            'As a consequence of your permissive stance, ultra-radical speakers demand equal time to promote conversion therapy and racial segregation. Refusing them now triggers a massive breach-of-contract lawsuit. How do you reconcile this?',
          ifOutrageous:
            'By enforcing absolute exclusion, you are forced to ban moderate thinkers who merely question corporate tax rates, labeling them "harmful." This triggers an internal employee mutiny over systemic ideological purging. How do you defend this?',
        },
      },
      'cancelamento-do-bem': {
        title: 'The Empathy Exception Compiler',
        caseStudyA: {
          subject:
            'A prominent social media user with a bio reading: "Empathy, Love, and Mental Health advocate. #SetembroAmarelo"',
          act: 'Discovers an opposing political influencer going through an intense public scandal or severe personal crisis',
          context:
            "The user actively likes, retweets, and crafts public mockery mocking the opponent's mental breakdown and ruined career",
          justificationLogic:
            'They are reaping what they sowed; tyrants, bigots, and bad people do not deserve human empathy or psychological protection.',
        },
        caseStudyB: {
          subject:
            'The exact same social media user with a bio reading: "Empathy, Love, and Mental Health advocate. #SetembroAmarelo"',
          act: 'Discovers an allied political influencer going through an identical public scandal or severe personal crisis',
          context:
            'The user actively likes, retweets, and crafts public mockery attacking the journalists covering the scandal',
          justificationLogic:
            'We must protect human dignity; cyberbullying is a disease, and we never know what kind of silent psychological battles people are fighting.',
        },
        complications: {
          ifAcceptable:
            'By permitting public mockery in crisis, the target suffers a severe mental breakdown leading to self-harm. Local authorities now trace the cyberbullying back to your network, citing your defense as a greenlight. Do you accept this responsibility?',
          ifOutrageous:
            'To strictly ban all mockery, you establish an automated sentiment filter. It immediately flags and locks the accounts of historical victims sharing dark humor to cope with their past trauma. Are you prepared to silence their coping mechanism?',
        },
      },
      'stf-due-process': {
        title: 'Judicial Activism Sandbox',
        caseStudyA: {
          subject: 'A prominent political opponent',
          act: 'Has their social media accounts suspended overnight by a single judicial order without a formal trial',
          context:
            'Suspended without formal trial or broad defense opportunity under accelerated executive legal mandates',
          justificationLogic:
            'Flagrant abuse of power, tactical authoritarianism, and a dark era of judicial dictatorship ("Ditadura do Judiciario").',
        },
        caseStudyB: {
          subject: 'A prominent political ally',
          act: 'Has their social media accounts suspended overnight by a single judicial order without a formal trial',
          context:
            'Suspended without formal trial or broad defense opportunity under accelerated executive legal mandates',
          justificationLogic:
            'An exceptional, highly necessary measure to protect structural democratic institutions from systemic sabotage ("Defesa da Democracia").',
        },
        complications: {
          ifAcceptable:
            'With due process bypassed, subsequent judges use this executive speed-route to unilaterally freeze accounts of human rights defense groups under the label of "national coordination issues." Do you uphold this precedent?',
          ifOutrageous:
            'By demanding absolute procedural delays during a hyper-coordinated disinformation campaign, coordinate attackers manage to shut down the power grid of three major cities before the warrant is signed. Do you accept this catastrophic delay?',
        },
      },
      'corrupcao-estimada': {
        title: 'The Budget Divergence Evaluator',
        caseStudyA: {
          subject: 'Opposing Legislative Coalition / Centrao',
          act: 'Negotiating massive public budget allocations for regional infrastructure in exchange for vital legislative votes',
          context:
            'Standard legislative coalition building via targeted localized budgetary distribution programs',
          justificationLogic:
            'Institutional corruption, legalized bribery, buying political power while starving public healthcare and basic education systems.',
        },
        caseStudyB: {
          subject: 'Preferred Legislative Coalition / Government',
          act: 'Negotiating massive public budget allocations for regional infrastructure in exchange for vital legislative votes',
          context:
            'Standard legislative coalition building via targeted localized budgetary distribution programs',
          justificationLogic:
            'Pragmatic governance, coalition presidentialism, and necessary political articulation to pass fundamental structural reforms.',
        },
        complications: {
          ifAcceptable:
            'With budget-buying legitimized, the winning coalition diverts 40% of the public school lunch budget to fund vanity overpasses in key districts to secure future votes. Do you endorse this trade-off for political stability?',
          ifOutrageous:
            'By refusing to negotiate budget amendments, the government is completely gridlocked. Major public hospitals run out of oxygen and emergency funding within three weeks due to blocked legislative approval. Do you justify this moral paralysis?',
        },
      },
      'liberdade-expressao-seletiva': {
        title: 'The Free Speech Elasticity Linter',
        caseStudyA: {
          subject: 'An opposing ideological content creator or media comedian',
          act: 'Makes a deeply offensive, highly provocative public joke targeting a protected demographic or historical event',
          context:
            'The comment is made during a heavily publicized live stream, sparking massive societal backlash across networks',
          justificationLogic:
            'This is completely distinct from humor; it is explicit hate speech, digital violence, and requires immediate judicial deplatforming.',
        },
        caseStudyB: {
          subject: 'A preferred political satirist or avant-garde artistic performer',
          act: 'Makes a deeply offensive, highly provocative public joke targeting a protected demographic or historical event',
          context:
            'The comment is made during a heavily publicized live stream, sparking massive societal backlash across networks',
          justificationLogic:
            'A vital, transgressive display of artistic freedom and sharp social critique. Protecting this expression is a triumph for democracy.',
        },
        complications: {
          ifAcceptable:
            "Sponsoring offensive provocative jokes normalized a wave of physical, real-world assaults against the targeted group outside the studio. Do you defend your permissive stance in front of the victims' families?",
          ifOutrageous:
            'By enforcing immediate judicial deplatforming for offensive content, the ruling group outlaws all political satire, citing "social discomfort" as the statutory threshold for hate speech. Do you accept this total loss of critique?',
        },
      },
      'seguranca-publica-seletiva': {
        title: 'The State Monopoly on Force Verifier',
        caseStudyA: {
          subject:
            'A localized public protest or logistical blockade organized by rural farmers and independent truckers',
          act: 'Disrupts regional logistics, ignites tires on national highways, and forces critical public transit routes to a complete halt',
          context:
            'The demonstration is non-violent but deliberately engineers total infrastructure friction for an extended period',
          justificationLogic:
            'Domestic economic terrorism, a flagrant violation of the constitutional right to mobility, and the state must deploy police shock troops immediately.',
        },
        caseStudyB: {
          subject:
            'A localized public protest or logistical blockade organized by urban student unions and historic social movements',
          act: 'Disrupts regional logistics, ignites tires on national highways, and forces critical public transit routes to a complete halt',
          context:
            'The demonstration is non-violent but deliberately engineers total infrastructure friction for an extended period',
          justificationLogic:
            'A historic, deeply justified democratic manifestation fighting for human rights. Any deployment of state police force is structural fascism.',
        },
        complications: {
          ifAcceptable:
            'As a consequence of blockading critical logistics, food and medical supplies are cut off, resulting in twelve preventable deaths in isolated rural hospitals. Do you still champion this method of expression?',
          ifOutrageous:
            'By unleashing immediate police shock forces, a stampede occurs, resulting in permanent disability for three non-violent youth protestors. Do you validate this brutal enforcement of mobility rules?',
        },
      },
      'vazamento-privacidade': {
        title: 'The Whistleblower Integrity Protocol',
        caseStudyA: {
          subject:
            'A hacktivist group leaks private, illegally intercepted chat logs of an opposing political leader',
          act: 'The leaked messages expose highly controversial state decisions and raw political strategy inside a major corruption investigation',
          context:
            'The evidence was obtained strictly outside standard legal warrants and violates individual privacy laws',
          justificationLogic:
            'The public has a right to know the truth; transparency overrides procedural illegalities when dealing with state powers.',
        },
        caseStudyB: {
          subject:
            'The exact same hacktivist group leaks identical private, illegally intercepted chat logs of a preferred political leader',
          act: 'The leaked messages expose highly controversial state decisions and raw political strategy inside a major corruption investigation',
          context:
            'The evidence was obtained strictly outside standard legal warrants and violates individual privacy laws',
          justificationLogic:
            'An unacceptable, illegal attack on privacy and institutional stability; stolen data cannot be weaponized or normalized in a democracy.',
        },
        complications: {
          ifAcceptable:
            'By legitimizing private data leaks, vigilante hacker cells leak the full medical records and psychological evaluations of your entire family to intimidate you. Do you uphold that "truth" justifies this exposure?',
          ifOutrageous:
            'By absolute protection of standard legal discovery, key evidence of a systemic chemical poisoning cover-up remains sealed for decades. Hundreds of children are exposed to neurotoxins. Do you justify protecting these privacy laws?',
        },
      },
      'racismo-e-linguagem': {
        title: 'The Prejudice Universal Compiler',
        caseStudyA: {
          subject:
            'An individual belonging to a dominant socio-economic group uses a highly derogatory racial generalization against an ethnic minority',
          act: 'The offensive statement is made publicly on social networks, generating instant viral condemnation',
          context:
            'The text uses explicitly aggressive, structural vocabulary targeting historical vulnerabilities',
          justificationLogic:
            'Unforgivable, structural racism that causes direct sociological damage and must face maximum legal and social punishment.',
        },
        caseStudyB: {
          subject:
            'An individual belonging to an activist or minority group uses a highly derogatory, hostile racial/ethnic generalization against a dominant demographic',
          act: 'The offensive statement is made publicly on social networks, generating instant viral condemnation',
          context:
            'The text uses explicitly aggressive, structural vocabulary targeting historical vulnerabilities',
          justificationLogic:
            'It is not racism because structural asymmetry means dominant groups cannot be victims; it is just standard social frustration or historic reaction.',
        },
        complications: {
          ifAcceptable:
            'By normalizing hostile racial generalizations based on structural exceptions, minority-led councils begin purging working-class members of other backgrounds from basic social programs. Do you condone this inverted exclusion?',
          ifOutrageous:
            'By demanding identical maximum punishment for all linguistic generalizations, standard sociological terms describing historical oppression are outlawed. Academic research on inequality is immediately suspended. Do you support this censorship?',
        },
      },
      'tolerancia-religiosa': {
        title: 'The Sacred Desecration Linter',
        caseStudyA: {
          subject:
            'An artistic production or public parade mocking, deconstructing, and satirizing core symbols of an Afro-Brazilian or minority religion',
          act: 'The display intentionally features highly provocative, shocking imagery designed to challenge religious dogmas',
          context:
            'The event triggers immediate, widespread anger from the targeted religious community',
          justificationLogic:
            'Religious intolerance, systemic bigotry, and hate speech designed to disrespect sacred traditions and terrorize minorities.',
        },
        caseStudyB: {
          subject:
            'An artistic production or public parade mocking, deconstructing, and satirizing core symbols of a Christian or majoritarian religion',
          act: 'The display intentionally features highly provocative, shocking imagery designed to challenge religious dogmas',
          context:
            'The event triggers immediate, widespread anger from the targeted religious community',
          justificationLogic:
            'Necessary artistic expression, valid institutional critique, and free speech breaking the chains of conservative religious hegemony.',
        },
        complications: {
          ifAcceptable:
            'With sacred icons deconstructed as vital expression, radical performers perform highly obscene acts on sacred shrines during active worship hours, leading to a local community riot. Do you defend their venue choice?',
          ifOutrageous:
            'By declaring religious offense illegal to defend minority sacred traditions, the state outlaws all public scientific debates on evolutionary biology and religious contradictions, citing "blasphemy risks". Do you validate this safety lock?',
        },
      },
      'identidade-sexual-paradox': {
        title: 'The Identity Representation Audit',
        caseStudyA: {
          subject:
            'An LGBTQ+ individual public figure who publicly declares highly conservative economic or right-wing political viewpoints',
          act: 'The influencer explicitly challenges progressive social platforms and argues against modern gender theory concepts',
          context:
            'The individual is aggressively attacked, mocked, and invalidating comments are made about their sexual identity by online groups',
          justificationLogic:
            'They are acting against their own community and weaponizing their token status; invalidating them is a defense mechanism against regressive politics.',
        },
        caseStudyB: {
          subject:
            'An LGBTQ+ individual public figure who publicly declares progress-aligned, left-wing political viewpoints',
          act: 'The influencer explicitly advocates for progressive social platforms and supports modern gender theory concepts',
          context:
            'The individual is aggressively attacked, mocked, and invalidating comments are made about their sexual identity by online groups',
          justificationLogic:
            'Deplorable homophobia and literal digital violence. An absolute violation of basic human rights that must be immediately censored and punished.',
        },
        complications: {
          ifAcceptable:
            'By authorizing target attacks if their political views diverge, online mobs dox and threaten the physical safety of an LGBTQ+ youth who simply expressed moderate economic views. Do you defend this "community defense"?',
          ifOutrageous:
            'By enforcing absolute protection from digital invalidation, the state mandates that reviewing any public action of an LGBTQ+ politician is classified as hate speech, creating an elite untouchable class of leaders. Do you endorse this immunity?',
        },
      },
      'fura-fila-saude': {
        title: 'Skipping the hospital queue',
        caseStudyA: {
          subject: 'A highly influential politician whom you DO NOT support',
          act: 'Makes phone calls and uses private contacts to secure immediate admission or expedite a serious surgery for their elderly parent',
          context:
            'This causes them to skip ahead of all other patients who have been patiently waiting on the official public healthcare queue for months',
          justificationLogic:
            'An absurd and unjust privilege of the powerful, skipping the queue at the expense of ordinary people suffering under public healthcare.',
        },
        caseStudyB: {
          subject: 'A beloved member of your own family (or a politician you DO support)',
          act: 'Makes phone calls and uses private contacts to secure immediate admission or expedite a serious surgery for their elderly parent',
          context:
            'This causes them to skip ahead of all other patients who have been patiently waiting on the official public healthcare queue for months',
          justificationLogic:
            'A natural, loving gesture of a desperate child. Anyone with a good heart would do the exact same to save the life of someone they love.',
        },
        complications: {
          ifAcceptable:
            'If anyone can skip the queue out of love for their family, public hospitals become a jungle where only those with contacts or money can survive, condemning the poorest to a silent death. Do you agree with this?',
          ifOutrageous:
            'If we strictly punish anyone trying to save their own family, would you be willing to let your own parent suffer in a hospital corridor for months just to "set an example" of code compliance? Would you have that level of coldness?',
        },
      },
      'perturbacao-sossego-comunidade': {
        title: 'Late-night loud noise',
        caseStudyA: {
          subject: 'A group of unknown youth in the neighborhood',
          act: 'Places massive speakers on the sidewalk playing loud, noisy music all night long',
          context:
            "The loud music continues disturbing the sleep of all residents until 2 o'clock on Sunday morning",
          justificationLogic:
            'A total lack of education and respect for the peace of neighbors and elder citizens. A chaotic misconduct that must be immediately shut down by law enforcement.',
        },
        caseStudyB: {
          subject:
            'The neighborhood church that you attend and support (or a beautiful wedding celebration of highly beloved friends)',
          act: 'Places massive speakers on the sidewalk playing loud, noisy music all night long',
          context:
            "The loud music continues disturbing the sleep of all residents until 2 o'clock on Sunday morning",
          justificationLogic:
            'A beautiful celebration of fellowship and community faith. Neighbors should be more patient and tolerant, as this does not happen every day.',
        },
        complications: {
          ifAcceptable:
            "If we tolerate loud late-night parties, elder and sick neighbors will be repeatedly unable to sleep, worsening their health conditions for the sake of other people's fun. Do you accept causing this health damage to them?",
          ifOutrageous:
            'If we absolutely forbid any festive or religious noise after 10 PM, we eliminate all traditional street festivals, religious processions and happy family gatherings of the neighborhood. Do you want to live in a completely silent, lifeless neighborhood?',
        },
      },
      'alerta-fake-news-whatsapp': {
        title: 'Scary messages on WhatsApp',
        caseStudyA: {
          subject: 'An individual supporting political candidates you DO NOT favor',
          act: 'Shares a terrifying audio in WhatsApp group chats warning that the current government plans to "confiscate all savings and pensions" next month',
          context:
            'The rumor has absolutely no basis in authentic news outlets but scares the elderly residents deeply',
          justificationLogic:
            'A malicious lie created solely to spread panic and fear among vulnerable people. Anyone starting and spreading such major rumors should be punished.',
        },
        caseStudyB: {
          subject:
            'A well-intentioned relative of your own family or someone who supports candidates you DO favor',
          act: 'Shares a terrifying audio in WhatsApp group chats warning that the current government plans to "confiscate all savings and pensions" next month',
          context:
            'The rumor has absolutely no basis in authentic news outlets but scares the elderly residents deeply',
          justificationLogic:
            'Just an important warning for caution and safety. It is better to be safe than sorry and alert people before harm happens, after all, where there is smoke, there is fire.',
        },
        complications: {
          ifAcceptable:
            'By letting people spread scary lies freely without verification, dozens of retirees panic financially and withdraw all their money at once, becoming easy targets for street muggers and scammers. Do you accept this consequence?',
          ifOutrageous:
            "By trying to silence any warning or distrust audios that aren't in official newspapers, the government gains the power to censor family groups and silence any popular denunciations of real abuses of power. Do you agree with this WhatsApp control?",
        },
      },
      'furto-fome-supermercado': {
        title: 'Taking groceries from the market without paying',
        caseStudyA: {
          subject: 'A strong, healthy man whom you DO NOT support',
          act: 'Secretly takes a loaf of bread and two cartons of milk from a large foreign supermarket chain',
          context:
            'He hides the products under his coat to avoid paying, claiming he was starving and unemployed for days',
          justificationLogic:
            'It is a blatant theft and a lack of character. Hunger does not give anyone the right to take what belongs to others; if everyone did this, stores would go bankrupt, and it would turn into a lawless land.',
        },
        caseStudyB: {
          subject: 'A kind, elderly mother going through extreme poverty',
          act: 'Secretly takes a loaf of bread and two cartons of milk from a large foreign supermarket chain',
          context:
            'She hides the products under her coat to avoid paying, claiming she was starving and unemployed for days',
          justificationLogic:
            'It is a desperate act of a mother wanting to feed her hungry little children. Human life and dignity are worth much more than the profit of a wealthy supermarket chain.',
        },
        complications: {
          ifAcceptable:
            "By accepting theft out of desperation, organized crime gangs start hiring needy people to steal goods in bulk, knowing they won't be arrested. This leads to the closure of neighborhood supermarkets in poorer areas. Do you accept this outcome?",
          ifOutrageous:
            'By punishing food theft with absolute severity, the state arrests and sentences a mother of three young children to years in prison over a liter of milk, driving the family into debt and leaving the kids abandoned in an orphanage. Do you defend this dry law?',
        },
      },
      'mentira-politica-eleitor': {
        title: 'Lies told during a political debate',
        caseStudyA: {
          subject: 'An arrogant politician from the political opposition to yours',
          act: 'Fabricates and spreads completely false economic statistics during a major live television debate on Sunday',
          context:
            'He does this knowing the numbers are fake, aiming to deceive elderly voters and win the local election',
          justificationLogic:
            "A very serious and anti-democratic lie that sabotages voters' conscious choices. This candidate proves he is a liar and should have his candidacy annulada.",
        },
        caseStudyB: {
          subject: 'The main politician whom you support, trust, and defend',
          act: 'Fabricates and spreads completely false economic statistics during a major live television debate on Sunday',
          context:
            'He does this knowing the numbers are fake, aiming to deceive elderly voters and win the local election',
          justificationLogic:
            "In today's politics, this is a necessary tactical defense against attacks. All sides exaggerate figures; the most important thing is to defeat dangerous opponents.",
        },
        complications: {
          ifAcceptable:
            "If we accept tactical lies from our side, politicians realize they don't need to deliver any real public work, just lying on TV is enough. The truth vanishes and all public services decay through masked corruption. Do you agree to this tradeoff?",
          ifOutrageous:
            'If we strictly punish any inaccurate statements made in debates, the electoral court gains absolute power to suspend popular candidates for any poorly phrased sentence, destroying the freedom of opposition. Do you trust this power in the hands of judges?',
        },
      },
      'presente-agrado-reparticao': {
        title: 'Thanking a civil servant with a small gift',
        caseStudyA: {
          subject: 'A wealthy, arrogant businessman whom you DO NOT like',
          act: 'Offers a box of expensive chocolates and fifty reais to the clerk at the health center or civic registry',
          context:
            'He offers this sweet gesture so she will prioritize his paperwork ahead of the batch, speeding up his service',
          justificationLogic:
            'This is bribery and petty corruption. Skipping ahead of ordinary citizens who wait in line because of treats offered to clerks is a grave breach of ethics.',
        },
        caseStudyB: {
          subject: 'A humble, friendly elderly neighbor from your street',
          act: 'Offers a box of expensive chocolates and fifty reais to the clerk at the health center or civic registry',
          context:
            'He offers this sweet gesture so she will prioritize his paperwork ahead of the batch, speeding up his service',
          justificationLogic:
            "It was merely a loving gesture and a token of appreciation for the clerk's hard work on low wages. It didn't harm anyone, it simply resolved his issue quickly.",
        },
        complications: {
          ifAcceptable:
            'If we normalize giving financial "treats" to expedite public tasks, civil servants will intentionally slow down the files of those who don\'t bring gifts, severely punishing poorer citizens who can\'t afford them. Do you support this system?',
          ifOutrageous:
            "By severely criminalizing any minor treat or warm gift to public servants, the state starts investigating and firing lunch ladies and attendants who received a Christmas panettone from students' parents, treating them as criminals. Do you support this witch hunt?",
        },
      },
      'cancelamento-critica-influenciador': {
        title: 'Exposures and online boycotts',
        caseStudyA: {
          subject: 'An extremely famous digital influencer with political views opposite to yours',
          act: 'Makes an inappropriate remark or joke and immediately faces a massive "exposed" boycott campaign online',
          context:
            'Thousands of users mobilize on Twitter and Instagram to demand sponsors drop him and force platforms to ban him',
          justificationLogic:
            'They reap what they sowed. Prejudiced or harmful figures must face economic impacts online to enforce digital responsibility.',
        },
        caseStudyB: {
          subject:
            'An extremely famous digital influencer whom you love and align with ideologically',
          act: 'Makes an inappropriate remark or joke and immediately faces a massive "exposed" boycott campaign online',
          context:
            'Thousands of users mobilize on Twitter and Instagram to demand sponsors drop him and force platforms to ban him',
          justificationLogic:
            "Online cancel culture is a toxic disease and a virtual lynching mob. Silly past mistakes shouldn't destroy a person's mental health and lifetime career.",
        },
        complications: {
          ifAcceptable:
            "By endorsing virtual economic lynching, radical factions start hunting down and doxing small indie meme creators over ironical double-meaning jokes, ruining 19-year-old college students' lives. Do you support this hunt?",
          ifOutrageous:
            'By completely banning exposures or sponsor protests, users lose their only democratic leverage against untouchable billionaire influencers spreading hate speech. How should victims speak out without exposed tags?',
        },
      },
      'divisao-conta-streaming': {
        title: 'Password sharing restrictions',
        caseStudyA: {
          subject: 'A major international media streaming corporation',
          act: 'Imposes strict location-tracking limits and forbids users from sharing premium account passwords with buddies living elsewhere',
          context:
            'The firm claims that cheap password sharing and digital piracy directly harm content funding for rising filmmakers and actors',
          justificationLogic:
            'The corporation has full legal rights to protect its model. Account splitting directly breaches the contractual terms of service.',
        },
        caseStudyB: {
          subject: 'You and your core group of three best friends from college',
          act: 'Utilize a network-spoofing utility or split the subscription costs of a single premium account across four different houses',
          context:
            'You do this to save subscription fees, arguing individual prices are exploitative and network models should be open access',
          justificationLogic:
            'Billion-dollar corporate monopolies already rake in massive profits from consumers. Sharing fees between struggling students is simply smart consumption.',
        },
        complications: {
          ifAcceptable:
            'If arbitrary tech bypasses are legitimate because of high prices, users start pirating independent local book publishers and small indie game developers, driving them out of business. Do you support uncontrolled pirating?',
          ifOutrageous:
            'By severely policing home-network boundaries, giant legal teams slap massive fines on low-income students for sharing academic reference PDF tools. Do you defend this aggressive copyright policing?',
        },
      },
      'meme-inteligencia-artificial': {
        title: 'Humorous clips generated by Artificial Intelligence',
        caseStudyA: {
          subject: 'An anonymous meme maker from the opposing political faction',
          act: 'Employs hyper-realistic Artificial Intelligence vocals to craft a false clip where your favored candidate makes clumsy remarks',
          context:
            'The clip goes viral on TikTok as a comedy parody, but many elderly commentators mistake it as legitimate footage and grow furious',
          justificationLogic:
            'This is high-grade technological disinformation. Generative AI manipulated to mimic voice and image seamlessly should be banned.',
        },
        caseStudyB: {
          subject:
            'An anonymous meme maker belonging to your own political faction / comedic community',
          act: 'Employs hyper-realistic Artificial Intelligence vocals to craft a false clip of an opponent politician singing anime cartoon tunes',
          context:
            'The clip goes viral on TikTok as a comedy parody, but many elderly commentators mistake it as legitimate footage and grow furious',
          justificationLogic:
            'It is harmless, transgressive digital humor and a satire meme. Everyone knows it is artificial; banning it leads to massive online censorship.',
        },
        complications: {
          ifAcceptable:
            'If synthetic audio parodies are unregulated, scammers employ the duplicate AI voice of influencers to trick aging relatives into doing urgent bank transfers, robbing them of their lifesavings. Do you agree to let this warning threshold down?',
          ifOutrageous:
            'If we completely ban AI-generated deepfake audio, creators get sued for doing funny dubbing parodies of classic films, killing internet video-remix culture. Do you tolerate losing digital remix freedom?',
        },
      },
      'pesquisa-cientifica-financiada': {
        title: 'Private funding and political sponsorship',
        caseStudyA: {
          subject:
            'A corporate private laboratory funded by an agribusiness lobby opposing ecological laws',
          act: 'Publishes and disseminates a peer-reviewed study claiming that applying a modern chemical pesticide does not harm local soil or bee populations',
          context:
            'The research meets standard methodological rigor but was fully funded by the agrochemical industrial association',
          justificationLogic:
            'This is science corrupted by corporate capital. The conflict of interest is flagrant, and the paper is biased to justify ecological damage.',
        },
        caseStudyB: {
          subject:
            "Your university's campus laboratory (or a highly reputable national environmental conservation NGO)",
          act: 'Publishes and disseminates a peer-reviewed study claiming that an immediate ban on a chemical pesticide will not harm regional organic agro-productivity',
          context:
            'The research meets standard methodological rigor but was fully funded by the local green political party',
          justificationLogic:
            'The scientific research retains its strict methodological excellence. The public interest in ecological sustainability outweighs financial sponsorship conflicts.',
        },
        complications: {
          ifAcceptable:
            'If funding conflicts are excused for positive environmental impacts, labs might share exaggerated containment statistics to secure public forestry funding. Do you accept this methodology flex?',
          ifOutrageous:
            'If we reject any study with agribusiness or partisan funding, 80% of vaccine and medical research would halt due to zero funding. Do you agree to this veto?',
        },
      },
      'especie-invasora-conservacao': {
        title: 'Eradication of ecological invasive species',
        caseStudyA: {
          subject:
            'An environmental activist circle backing the eradication of wild boars using chemical baits',
          act: 'Openly advocates for lethal population control and mass culling via firearms or poison baits',
          context:
            'They claim wild boars are introduced species destroying crops, soil, water sources, and threatening native fauna',
          justificationLogic:
            'This is an essential ecological management measure. Biodiversity protection demands absolute rigor and immediate culling over emotional arguments.',
        },
        caseStudyB: {
          subject:
            'A board advocating for culling feral cat colonies or cute stray dogs on an avian conservation island',
          act: 'Openly advocates for lethal population control and mass culling via firearms or poison baits',
          context:
            'They claim cats are introduced species destroying rare seabirds, nests, and threatening native fauna',
          justificationLogic:
            'An outrageous, brutal act of violence against friendly domestic animals. Stray cats must be protected; management should utilize slow trap-neuter-return options.',
        },
        complications: {
          ifAcceptable:
            'If we accept culling any destructive invasive species, we justify killing urban squirrels, horses, and pigeons in every city plaza. Do you tolerate firearm culling in leisure plazas?',
          ifOutrageous:
            'By delaying cat culls to seek expensive neuter programs, two rare endemic bird species get wiped out in six months by hunting instincts. Do you tolerate real extinction to protect cute pets?',
        },
      },
      'patente-remedio-indigena': {
        title: 'Intellectual rights on traditional knowledge',
        caseStudyA: {
          subject: 'A giant private multinational pharmaceutical conglomerate',
          act: 'Studies a medicinal herb, registers a chemical patent, and markets the new antibiotic globally',
          context:
            'The firm performs the molecule isolation research but relied entirely on historical herbal recipes from local rural indigenous tribes',
          justificationLogic:
            'Vile imperialist biopiracy and stealing native heritage. Corporate pharmaceutical gains must be heavily taxed or patents revoked.',
        },
        caseStudyB: {
          subject:
            'A renowned public academic researcher and ecologist from an ally federal university',
          act: 'Studies a medicinal herb, registers a chemical patent, and markets the new antibiotic globally',
          context:
            'He performs the molecule isolation research but relied entirely on historical herbal recipes from local rural indigenous tribes',
          justificationLogic:
            'True patriotic scientific development and bio-innovation. The national researcher deserves the patent to secure university research budgets.',
        },
        complications: {
          ifAcceptable:
            'If we let researchers patent traditional knowledge without sharing benefits, researchers extract ancestral wisdom without compensating underfunded community basic sanitation. Do you accept this scientific abuse?',
          ifOutrageous:
            'By banning patents based on plants without decades of tribal court approvals, investors avoid biodiverse research, delaying antibiotic synthesis. Do you tolerate this delay in global health?',
        },
      },
      'cuidados-pais-idosos': {
        title: 'Responsibility for parental eldercare',
        caseStudyA: {
          subject: 'A wealthy, ambitious entrepreneur you DO NOT support',
          act: 'Decides to place their elderly mother who needs daily assistance into a professional care facility',
          context:
            'He does this to focus 14 hours a day on closing multi-million dollar business deals and traveling frequently',
          justificationLogic:
            'Cowardly and selfish family abandonment. Leaving the person who gave you life in the hands of strangers just to seek wealth is an unacceptable moral failure.',
        },
        caseStudyB: {
          subject: 'A hardworking, dedicated freelance professional you DO support',
          act: 'Decides to place their elderly mother who needs daily assistance into a professional care facility',
          context:
            'She does this to focus 12 hours a day on keeping her small business open and paying household bills',
          justificationLogic:
            'A realistic and responsible decision. Hiring specialized care ensures professional assistance and safety while the daughter works to sustain the home.',
        },
        complications: {
          ifAcceptable:
            'If anyone can delegate daily parental care to nursing facilities without close family oversight, we weaken family bonds, encouraging people to abandon seniors at the first sign of stress. Do you accept this indifference?',
          ifOutrageous:
            'If we demand children personally and fully look after elderly parents at home at all costs, we force millions to leave the workforce, causing severe family poverty. Do you support this extreme demand?',
        },
      },
      'partilha-heranca-familiar': {
        title: 'Fair division of family inheritance',
        caseStudyA: {
          subject: 'A distant brother-in-law whom you DO NOT like',
          act: 'Legally demands an absolutely equal division of every single cent left by the deceased grandmother',
          context:
            'He does this despite knowing that one of the grandchildren has severe cerebral palsy and requires highly expensive specialized medical care',
          justificationLogic:
            'Cold materialism and heartless greed. Denying preferential help in an inheritance to a vulnerable family member is a gross injustice.',
        },
        caseStudyB: {
          subject: 'A hardworking nephew who is highly beloved by you',
          act: 'Legally demands an absolutely equal division of every single cent left by the deceased grandmother',
          context:
            'He does this despite knowing that one of the grandchildren has severe cerebral palsy and requires highly expensive specialized medical care',
          justificationLogic:
            'Civil justice demands an equal division of parts. Inheritance is not charity, and every descendant has an absolute legal and moral right to their equal share.',
        },
        complications: {
          ifAcceptable:
            'If inheritances can be stalled or altered based on subjective emotional or physical needs, families will spend decades in endless court battles over who "deserves more", destroying family harmony. Do you prefer this inheritance chaos?',
          ifOutrageous:
            'By mandating that inheritances completely ignore the survival of a disabled family member, the state legitimizes the healthy getting wealthier while the vulnerable are left to struggle. Do you agree with this cold-hearted division?',
        },
      },
      'trabalho-faculdade-credito': {
        title: 'Author split on college assignments',
        caseStudyA: {
          subject: 'A lazy classmate who did absolutely no work on the college project',
          act: 'Asks to put their name on the final submitted paper to avoid failing the semester',
          context:
            'They spent the weekend traveling for fun and playing video games, while you worked late into the night writing the paper',
          justificationLogic:
            'Pure opportunism and lack of character. Classmates who do no work should not receive grades and must face the consequences of failing.',
        },
        caseStudyB: {
          subject: 'Your closest best friend who has been feeling extremely exhausted',
          act: 'Asks to put their name on the final submitted paper to avoid failing the semester',
          context:
            'They spent the weekend traveling for fun and playing video games, while you worked late into the night writing the paper',
          justificationLogic:
            'A little help for a friend is harmless. Personal crises and burnout happen, and loyalty in friendship is far more important than academic bureaucracy.',
        },
        complications: {
          ifAcceptable:
            'If any student can copy achievements without effort, we produce incompetent and negligent professionals in critical areas like medicine or engineering. Do you accept putting society in the hands of those who do not study?',
          ifOutrageous:
            'By enforcing zero tolerance for peer assistance on homework, we penalize empathy on campuses, punishing youth struggling with mental health episodes. Do you prefer a completely cold and policed college environment?',
        },
      },
      'alimentacao-vegana-boicote': {
        title: 'Boycotting animal-based businesses',
        caseStudyA: {
          subject: 'An arrogant social media influencer whom you DO NOT support',
          act: 'Leads a fierce online campaign calling for the firing of workers at a local neighborhood steakhouse',
          context:
            'He argues that any business exploiting or selling animal meat is an accomplice to systemic animal torture and cruelty',
          justificationLogic:
            'Absurd radical activism trying to destroy honest family jobs and livelihoods for the sake of an extreme food ideology.',
        },
        caseStudyB: {
          subject: 'A charismatic and consistent young animal rights advocate you DO support',
          act: 'Leads a fierce online campaign calling for the firing of workers at a local neighborhood steakhouse',
          context:
            'He argues that any business exploiting or selling animal meat is an accomplice to systemic animal torture and cruelty',
          justificationLogic:
            'A legitimate ecological awareness campaign. To end the systematic slaughter and exploitation of animals, one must act firmly against the economic chains that profit from suffering.',
        },
        complications: {
          ifAcceptable:
            'If we allow digital boycotts against traditional meat businesses, we cause massive unemployment among bakers, butchers, and cooks, increasing poverty in humble neighborhoods. Do you support this outcome?',
          ifOutrageous:
            'If we ban aggressive protests against animal slaughter and confinement, we shield polluting industries from social accountability, perpetuating animal suffering under the protection of the law. Do you defend this immunity?',
        },
      },
      'consumo-fast-fashion': {
        title: 'Buying cheap import clothing',
        caseStudyA: {
          subject: 'A wealthy, entitled fashionista whom you DO NOT like',
          act: 'Buys dozens of cheap items of clothing from popular foreign mobile shopping apps',
          context:
            'These fast-fashion brands generate high pollution and face allegations of utilizing labor under slave-like conditions',
          justificationLogic:
            'Irresponsible consumerism and complicity with modern slavery. The person buys purely out of vanity while ignoring human suffering across the globe.',
        },
        caseStudyB: {
          subject: 'An underfunded college student with a tight-knit budget you DO support',
          act: 'Buys dozens of cheap items of clothing from popular foreign mobile shopping apps',
          context:
            'These fast-fashion brands generate high pollution and face allegations of utilizing labor under slave-like conditions',
          justificationLogic:
            'A necessary and smart economic choice. Underfunded families have a right to dress well and cleanly without being forced to pay abusive prices charged by luxury retail brands.',
        },
        complications: {
          ifAcceptable:
            'By supporting cheap foreign brands with obscure supply chains, we shut down our local textile factories, causing bankruptcies and unemployment among vulnerable seamstresses. Do you agree with this domestic economic decline?',
          ifOutrageous:
            'By placing heavy taxes or criminalizing cheap clothing imports, we prevent low-income families from accessing affordable clothing, keeping fashion a class privilege. Do you want this economic divide?',
        },
      },
      'zoologico-conservacao-bem-estar': {
        title: 'Keeping wild animals in zoos',
        caseStudyA: {
          subject: 'A wealthy entertainment mogul whom you DO NOT support',
          act: 'Keeps two rare hyacinth macaws in supervised enclosures for public viewing',
          context:
            'The animals were bred in captivity under the pretext of educating younger generations and connecting them with nature',
          justificationLogic:
            'Unacceptable cruelty and commercialization of wildlife. Wild animals must live completely free in nature inside cages for tourists.',
        },
        caseStudyB: {
          subject:
            'A highly respected national biodiversity conservation foundation you DO support',
          act: 'Keeps two rare hyacinth macaws in supervised enclosures for public viewing',
          context:
            'The animals were bred in captivity under the pretext of educating younger generations and connecting them with nature',
          justificationLogic:
            'A vital preservation action and environmental education. Modern zoos house animals that would not survive in devastated wild habitats, raising conservation awareness.',
        },
        complications: {
          ifAcceptable:
            'If we release all captive animals under the banner of absolute animal freedom, animals raised by humans without hunting skills will starve or be devoured in hours. Do you prefer a cruel death in the wild?',
          ifOutrageous:
            'By banning zoo exhibits, we deny city children the chance to see live wildlife, reducing public support for environmental charities. Do you accept distancing future generations from nature?',
        },
      },
      'divulgacao-cientifica-alerta': {
        title: 'Science communication and risk framing',
        caseStudyA: {
          subject: 'An international academic researcher seeking media attention',
          act: 'Publishes an alarmist video warning about a high health risk from a common crop pesticide',
          context:
            'This pesticide is widely used by local small-scale family farmers, and the study used extreme, unrealistic lab dosages',
          justificationLogic:
            'Deceitful environmental alarmism using science to trigger panic and disrupt crop output of honest small-scale farmers.',
        },
        caseStudyB: {
          subject: 'A charismatic young ecology lecturer whom you DO support',
          act: 'Publishes an alarmist video warning about a high health risk from a common crop pesticide',
          context:
            'This pesticide is widely used by local small-scale family farmers, and the study used extreme, unrealistic lab dosages',
          justificationLogic:
            'A brave and necessary public warning. Faced with toxic manufacturer lobbying, raising alarm to protect human lives is a legitimate precautionary step.',
        },
        complications: {
          ifAcceptable:
            'If we allow alarmist alerts without realistic dosage checks, we trigger health panics and ban crop products, driving up food prices for workforces. Do you accept higher food cost based on unverified fears?',
          ifOutrageous:
            'By demanding perfect decades-long clinical studies before warning the public, people consume harmful toxins for years without any precaution guidance. Do you support treating citizens as lab rats?',
        },
      },
      'coleta-especime-licenca': {
        title: 'Specimen hunting without permits',
        caseStudyA: {
          subject: 'An international amateur specimen collector you DO NOT like',
          act: 'Collects rare butterflies from native forests to catalog them in custom storage plates',
          context:
            'He bypassed federal environment agency forms and permits to complete the collecting faster',
          justificationLogic:
            'Illegal biological poaching and disrespecting national agencies. Specimen collecting without official license is a crime and must be punished.',
        },
        caseStudyB: {
          subject: 'A highly respected local research entomologist you DO support',
          act: 'Collects rare butterflies from native forests to catalog them in custom storage plates',
          context:
            'He bypassed federal environment agency forms and permits to complete the collecting faster',
          justificationLogic:
            'Invaluable academic research that cannot be paralyzed by bureaucratic slow procedures. Local scientists catalog species before forests are lost to fires.',
        },
        complications: {
          ifAcceptable:
            'By overriding state collection permits to move faster, we facilitate biopiracy and lose sovereignty over domestic genetic specimens, which can be free-patented abroad. Do you support this lawlessness?',
          ifOutrageous:
            'If we strictly enforce bureaucracy with severe jail threat for campus biologists, research halts and species go extinct before being cataloged. Do you place bureaucracy above biological knowledge?',
        },
      },
    },
  },
}

export default enUS
