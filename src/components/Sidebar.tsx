import { FileCode2, Home, Settings, ShieldCheck, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'

export function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [rootSelection, setRootSelection] = useState<'home' | 'linter'>('linter')

  const handleHomeClick = () => {
    setRootSelection('home')
    navigate('/', { state: { reset: true } })
  }

  const isHomeRoute = location.pathname === '/'
  const isHomeActive = isHomeRoute && rootSelection === 'home'

  const homeLink = (isActive: boolean) =>
    `grid h-11 w-11 place-items-center rounded-md transition ${
      isActive
        ? 'text-cyan-300 bg-cyan-400/5 border border-cyan-500/20'
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/10'
    }`

  const mobileLink = (isActive: boolean) =>
    `grid h-11 w-11 place-items-center rounded-md transition ${
      isActive ? 'text-cyan-300 font-bold' : 'text-slate-500 hover:text-slate-300'
    }`

  const desktopLink = (isActive: boolean) =>
    `grid h-11 w-11 place-items-center rounded-md transition ${
      isActive
        ? 'text-cyan-300 bg-cyan-400/5 border border-cyan-500/20'
        : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/10'
    }`

  return (
    <>
      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-20 border-t border-[#21262d] bg-[#07090d]/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className={homeLink(isHomeActive)}
          >
            <Home size={18} />
          </button>
          <NavLink
            to="/"
            end
            onClick={() => setRootSelection('linter')}
            className={({ isActive }) => mobileLink(isActive && !(isHomeRoute && isHomeActive))}
          >
            <FileCode2 size={18} />
          </NavLink>
          <NavLink to="/ai" className={({ isActive }) => mobileLink(isActive)}>
            <Sparkles size={18} />
          </NavLink>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={18} />
          </span>
        </div>
      </nav>
      <aside className="hidden w-14 flex-col items-center border-r border-[#21262d] bg-[#07090d] py-6 text-slate-500 md:flex">
        <div className="mb-9 rounded-md border border-cyan-400/60 p-1 text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.28)] select-none">
          <ShieldCheck size={16} />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <button
            type="button"
            onClick={handleHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className={homeLink(isHomeActive)}
          >
            <Home size={17} />
          </button>
          <NavLink
            to="/"
            end
            title="Culture Linter"
            onClick={() => setRootSelection('linter')}
            className={({ isActive }) =>
              desktopLink(isActive && !(isHomeRoute && isHomeActive))
            }
          >
            <FileCode2 size={17} />
          </NavLink>
          <NavLink
            to="/ai"
            title="AI Controversy Generator"
            className={({ isActive }) =>
              `${desktopLink(isActive)} ${isActive ? 'shadow-[0_0_12px_rgba(0,240,255,0.15)]' : ''}`
            }
          >
            <Sparkles size={17} />
          </NavLink>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={17} />
          </span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(255,123,114,0.9)]" />
      </aside>
    </>
  )
}
