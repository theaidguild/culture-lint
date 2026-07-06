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

- RunPod base path: `https://67zqqbuwug0fxi-11434.proxy.runpod.net/v1`
- Generation endpoint: `POST /v1/chat/completions`
- Model discovery endpoint: `GET /v1/models`

Optional environment variables:

- `VITE_RUNPOD_BASE_PATH` (default: `https://67zqqbuwug0fxi-11434.proxy.runpod.net/v1`)
- `VITE_RUNPOD_TIMEOUT_MS` (default: `45000`)
- `VITE_RUNPOD_MODEL_QWEN257B`

Example:

```sh
VITE_RUNPOD_BASE_PATH=https://67zqqbuwug0fxi-11434.proxy.runpod.net/v1
VITE_RUNPOD_TIMEOUT_MS=45000
VITE_RUNPOD_MODEL_QWEN257B=qwen2.5:7b
```
