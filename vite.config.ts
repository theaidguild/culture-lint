import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const aiBasePath = env.VITE_AI_BASE_PATH?.trim() || '/api/ai'
  const aiProxyTarget = env.AI_PROXY_TARGET?.trim()

  return {
    server:
      aiProxyTarget && aiBasePath.startsWith('/')
        ? {
            proxy: {
              [aiBasePath]: {
                target: aiProxyTarget,
                changeOrigin: true,
                rewrite: (path) => {
                  const suffix = path.slice(aiBasePath.length)
                  return suffix ? `/v1${suffix}` : '/v1'
                },
              },
            },
          }
        : undefined,
    plugins: [react(), tailwindcss()],
  }
})
