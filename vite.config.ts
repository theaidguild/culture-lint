import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const runpodBasePath = env.VITE_RUNPOD_BASE_PATH?.trim() || '/api/runpod'
  const runpodProxyTarget = env.RUNPOD_PROXY_TARGET?.trim()

  return {
    server:
      runpodProxyTarget && runpodBasePath.startsWith('/')
        ? {
            proxy: {
              [runpodBasePath]: {
                target: runpodProxyTarget,
                changeOrigin: true,
                rewrite: (path) => {
                  const suffix = path.slice(runpodBasePath.length)
                  return suffix ? `/v1${suffix}` : '/v1'
                },
              },
            },
          }
        : undefined,
    plugins: [react(), tailwindcss()],
  }
})
