import { FileCode2, Home, Settings, ShieldCheck, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SidebarProps {
  currentView: 'linter' | 'ai-generator'
  onViewChange: (view: 'linter' | 'ai-generator') => void
  onHomeClick: () => void
}

export function Sidebar({ currentView, onViewChange, onHomeClick }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <>
      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-20 border-t border-[#21262d] bg-[#07090d]/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'linter'
                ? 'text-cyan-300 bg-cyan-400/5'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Home size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('linter')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'linter'
                ? 'text-cyan-300 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FileCode2 size={18} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('ai-generator')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'ai-generator'
                ? 'text-cyan-300 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Sparkles size={18} />
          </button>
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
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'linter' && currentView === 'linter'
                ? 'text-cyan-300 bg-cyan-400/5'
                : 'text-slate-500 hover:text-slate-200'
            }`}
          >
            <Home size={17} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('linter')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'linter'
                ? 'text-cyan-300 bg-cyan-400/5 border border-cyan-500/20'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/10'
            }`}
            title="Culture Linter"
          >
            <FileCode2 size={17} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('ai-generator')}
            className={`grid h-11 w-11 place-items-center rounded-md transition ${
              currentView === 'ai-generator'
                ? 'text-cyan-300 bg-cyan-400/5 border border-cyan-500/20 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/10'
            }`}
            title="AI Controversy Generator"
          >
            <Sparkles size={17} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={17} />
          </span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(255,123,114,0.9)]" />
      </aside>
    </>
  )
}
