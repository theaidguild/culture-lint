import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './i18n'
import Root from './Root.tsx'

const SPA_REDIRECT_KEY = 'culture-lint:spa-redirect'

function restoreSpaRoute() {
  if (typeof window === 'undefined') return

  const base = import.meta.env.BASE_URL
  const redirectedPath = window.sessionStorage.getItem(SPA_REDIRECT_KEY)
  if (!redirectedPath) return

  window.sessionStorage.removeItem(SPA_REDIRECT_KEY)

  const isAtBaseRoot =
    window.location.pathname === base || window.location.pathname === `${base}index.html`

  if (!isAtBaseRoot) return

  window.history.replaceState(null, '', `${base}${redirectedPath}`)
}

restoreSpaRoute()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Root />
    </BrowserRouter>
  </StrictMode>
)
