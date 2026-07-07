import { createElement, lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import Root from './Root'

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

const AIPage = lazy(() => import('./pages/AIPage.tsx'))
const AboutPage = lazy(() => import('./pages/AboutPage.tsx'))

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: createElement(Root),
      errorElement: createElement(RouteErrorBoundary),
      children: [
        {
          element: createElement(Layout),
          children: [
            {
              index: true,
              element: createElement(Suspense, { fallback: null }, createElement(AIPage)),
            },
            {
              path: 'about',
              element: createElement(Suspense, { fallback: null }, createElement(AboutPage)),
            },
            { path: '*', element: createElement(Navigate, { to: '/', replace: true }) },
          ],
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
)
