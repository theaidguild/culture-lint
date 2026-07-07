import { createElement, lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RouteErrorBoundary } from './components/RouteErrorBoundary'
import Root from './Root'

const AIPage = lazy(() => import('./pages/AIPage.tsx'))

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
