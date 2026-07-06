# Culture-Lint

Culture-Lint is a React, TypeScript, and Vite single-page app that presents a three-step semantic linter wizard:

1. Select an immutable baseline principle.
2. Enter metadata for two comparable case studies.
3. Compile the scenario to review the simulated consistency analysis.

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
