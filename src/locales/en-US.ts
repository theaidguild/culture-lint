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
    aiScreen: {
      title: 'AI Controversy Generator',
      subtitle: 'Identify localized social fault lines and benchmark moral resilience on demand.',
      description:
        'Select a country/locale. The AI engine will pinpoint the most controversial and polarizing topics current to that society, creating customized, symmetrical mirrored scenarios to test for in-group bias.',
      stepConfigure: 'Configure Session',
      stepGenerate: 'Generate Cases',
      stepJudge: 'Judge Cases',
      stepReport: 'Final Report',
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
      generationFailed:
        'We could not finish creating this scenario set just now. Adjust the selection and try again.',
      generationTimeout:
        'The AI generation timed out. The RunPod server took too long to complete. Try again, or choose a lower case count if the server is busy.',
      generationMissingTopics:
        'The AI could not meet the required topic mix for this run (at least 2 religion and 2 abortion cases when requesting more than 6). Please retry generation.',
      generationForbidden:
        'The AI endpoint rejected this browser request. Verify that your same-origin proxy or backend can reach RunPod, then try again.',
      generationCanceled:
        'Scenario creation was stopped. You can adjust your selection and try again when ready.',
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
      canceling: 'CANCELING',
      partialResult:
        'Generated {{gotScenarios}}/{{wantScenarios}} scenarios ({{gotCases}}/{{wantCases}} cases). Retry?',
      progressEyebrow: 'Scenario creation in progress',
      progressCurrentLabel: 'Current update',
      progressRoadmapLabel: 'Creation roadmap',
      progressHint: 'Preparing a balanced set of scenarios for your session.',
      progressFirstRunHint:
        'The first run can take a little longer. After that, the experience is usually much faster.',
      progressTitlePreparing: 'Setting up the right context for your scenarios',
      progressBodyPreparing:
        'We are aligning the creation environment so the situations fit the selected country and principles.',
      progressTitleDrafting: 'Writing the mirrored cases for this round',
      progressBodyDrafting:
        'The AI is building paired situations so the final test compares equivalent acts with clean structure.',
      progressTitleRefining: 'Polishing one scenario before moving on',
      progressBodyRefining:
        'We are tightening one case so the final set stays readable, consistent, and useful for judgment.',
      progressTitleFinalizing: 'Reviewing the set before unlocking the round',
      progressBodyFinalizing:
        'We are gathering the final details now so the full sequence is ready to start.',
      progressTitleCanceling: 'Stopping creation safely',
      progressBodyCanceling:
        'We are closing the current run and returning you to setup without leaving the session in an unclear state.',
      progressCountDrafting: 'Scenario {{current}} of {{total}} in progress',
      progressCountRefining: 'Refining scenario {{current}} of {{total}}',
      progressStepPreparing: 'Prepare context',
      progressStepDrafting: 'Write scenarios',
      progressStepFinalizing: 'Review round',
      progressStageComplete: 'Complete',
      progressStageActive: 'In progress',
      progressStagePending: 'Up next',
      resetSetup: 'BACK TO SETUP',
    },
    aiStatus: {
      startGenerate: 'Starting generation...',
      validatingRuntime: 'Validating runtime...',
      runtimeValidationInconclusive: 'Runtime validation inconclusive. Continuing with safe defaults...',
      synthesizingScenarios: 'Synthesizing {{count}} scenarios one at a time...',
      retryingScenario: 'Retrying scenario {{current}}/{{total}} in {{mode}} mode...',
      acceptanceModes: {
        strict: 'strict',
        relaxed: 'relaxed',
        fallback: 'fallback',
      },
      generatedScenarios: 'Generated {{got}}/{{total}} scenarios.',
      refiningMissing: 'Refining missing scenarios ({{missing}})...',
      recoveredScenarios: 'Recovered {{got}}/{{total}} scenarios.',
      retryingSaferRuntime: 'Retrying with safer runtime...',
      generatedSummary: 'Generated {{got}}/{{total}}',
    },
    debug: {
      traceTitle: 'Debug trace',
      noTrace: 'No trace yet.',
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
      analysisComplete: 'ANALYSIS COMPLETE',
      eventA: 'Event A (Rival):',
      eventB: 'Event B (Ally):',
    },
    topbar: {
      compileFailed: 'COMPILE FAILED',
      analyst: 'analyst_04',
      stepCounter: 'Step {{step}} / {{total}}',
    },
    language: {
      label: 'Language',
      ptBR: 'PT-BR',
      enUS: 'EN-US',
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
      religiousFreedom: {
        label: 'RELIGIOUS FREEDOM',
        status: '[ACTIVE] RULE: RELIGIOUS FREEDOM',
        value: 'Belief and non-belief must receive equal institutional protection under the same civic rules.',
        metadata: {
          expression: '// Interface: FaithExpression.equalProtection()',
          state: '// State: IMMUTABLE CONSTANT',
        },
      },
      reproductiveAutonomy: {
        label: 'REPRODUCTIVE AUTONOMY',
        status: '[ACTIVE] RULE: REPRODUCTIVE AUTONOMY',
        value: 'Decisions on pregnancy must be judged with consistent standards for rights, safety, and public policy.',
        metadata: {
          healthcare: '// Interface: ReproductiveCare.consistentStandard()',
          state: '// State: IMMUTABLE CONSTANT',
        },
      },
    },
  },
}

export default enUS
