# Culture-Lint

Culture-Lint is an application for stress-testing moral and social consistency. Its conceptual foundation comes directly from **Behavior-Driven Development (BDD)**: just as BDD asks teams to define behavior expectations before writing code — using concrete examples to expose ambiguity — Culture-Lint asks users to define ethical principles before passing judgment, then uses structurally identical scenarios to expose inconsistencies in their own reasoning.

> [!IMPORTANT]
> **Judging is not condemning.** In everyday language, "to judge" has taken on a negative connotation because people intuitively conflate it with passing a sentence — as if to judge someone is to punish them. That is not what judgment means here. Judgment is a cognitive act: the act of forming an evaluation. Every time you decide whether something is fair, reasonable, or acceptable, you are judging. You cannot opt out of it. Culture-Lint does not ask you to condemn anyone; it asks you to notice whether you are applying the same evaluation criteria to structurally identical situations. The only thing being scrutinized is consistency — not character.

The core insight is that cultural and moral double standards behave a lot like software bugs: they are invisible until you run the right test. Culture-Lint runs that test. Instead of linting source code, it lints decision patterns.

The engine generates a batch of paired case studies. Each pair is structurally identical — same action, same context, same institutional setting — but with swapped subject identities (e.g. different religions, genders, or political affiliations). The user judges each case in isolation, without knowing how the pairs are connected. After all verdicts are in, the linting engine compares them. Any scenario where the user gave different verdicts to structurally equivalent acts is flagged as a **contradiction** — evidence of an identity-based double standard.

The four-step wizard walks through the full loop:

1. **Configure** — Select a country context, one or more ethical principles (e.g. equality, religious freedom, transparency), and the number of scenarios to generate.
2. **Generate** — The AI drafts and refines the paired case studies, streaming progress back to the UI in real time.
3. **Judge** — Evaluate each act one at a time. The presentation order is shuffled so mirrored pairs are hard to notice while answering. Complication hints appear when the system detects you already judged the sibling case, and an anti-gaming warning fires when your last several answers are suspiciously uniform.
4. **Report** — Review a full consistency analysis: how many scenarios were judged consistently, where contradictions appeared, and whether flat-line voting (marking everything acceptable or outrageous) undermined the session's validity.

## But why?

Most public debates about ethics, policy, and social behavior are not really about principles — they are about tribes. People rarely ask "would I accept this if the other side did it?" They don't need to, because the conversation never forces the comparison.

Culture-Lint forces it.

The motivation is simple: **consistency is the minimum bar for fairness**. You don't need to agree on which principles matter most. You don't need to reach consensus on contested topics. You just need to apply the same standard to structurally identical situations regardless of who is involved. If you can't do that, you don't have a principle — you have a preference dressed up as one.

The BDD parallel is intentional and not just cosmetic. In software, undefined behavior is the most dangerous kind: the system appears to work until it doesn't, and by then the damage is done. In social reasoning, undefined behavior looks like "I'll know it when I see it" — a judgment call that produces different outputs for the same input depending on context you won't admit is irrelevant. BDD's answer to undefined behavior is to write the spec first, in concrete, unambiguous examples, and then verify that the system actually satisfies it. Culture-Lint applies the same discipline to moral judgment: commit to a principle, then run the scenarios.

The goal is not to shame anyone. Contradictions are not proof of malice — they are proof of humanity. We all carry blind spots shaped by experience, identity, and the information we were exposed to. The point of surfacing them is the same as the point of a failing test: not to punish the developer, but to make the gap between intention and behavior visible so it can be addressed.

## Development

Install dependencies:

```sh
npm install
```

Run the local development server:

```sh
npm run dev
```

Validate the app:

```sh
npm run lint
npm run build
```

## Routing

The app is configured as a root-only SPA route surface:

- Canonical route: `/`
- Unknown paths: redirected to `/`
- No dedicated `/ai` route

Supported query params:

- `boot=false`: skip the boot screen
- `debug=1`: show in-app debug trace overlay
- AI setup params (deep-linkable): `country`, `principles`, `count`, `model`

## RunPod Integration

The AI scenario flow calls a RunPod instance using OpenAI-compatible chat
completions.

Default setup:

- Browser base path: `VITE_RUNPOD_BASE_PATH`
- Generation endpoint: `POST /v1/chat/completions`
- Model discovery endpoint: `GET /v1/models`

Recommended setups:

1. Direct browser access: set `VITE_RUNPOD_BASE_PATH` to your RunPod `/v1` URL and enable CORS upstream, for example with `OLLAMA_ORIGINS=*`.
2. Local proxy access: set `VITE_RUNPOD_BASE_PATH=/api/runpod` and `RUNPOD_PROXY_TARGET` to your RunPod origin. Vite will proxy `/api/runpod/*` to `${RUNPOD_PROXY_TARGET}/v1/*`.

If `VITE_RUNPOD_BASE_PATH` is unset, the app falls back to `/api/runpod`.

Optional environment variables:

- `VITE_RUNPOD_BASE_PATH` (default: `/api/runpod`)
- `RUNPOD_PROXY_TARGET` (used only by `vite.config.ts` for local proxying)
- `VITE_RUNPOD_TIMEOUT_MS` (default: `45000`)
- `VITE_RUNPOD_MODEL_QWEN257B`

Examples:

```sh
# direct browser calls
VITE_RUNPOD_BASE_PATH=https://your-runpod-host.example.net/v1
VITE_RUNPOD_TIMEOUT_MS=45000
VITE_RUNPOD_MODEL_QWEN257B=qwen2.5:7b
```

```sh
# local vite proxy
VITE_RUNPOD_BASE_PATH=/api/runpod
RUNPOD_PROXY_TARGET=https://your-runpod-host.example.net
VITE_RUNPOD_TIMEOUT_MS=45000
VITE_RUNPOD_MODEL_QWEN257B=qwen2.5:7b
```
