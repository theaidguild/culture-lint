import { FileCode2, Home, Settings, ShieldCheck, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface SidebarProps {
  onHomeClick: () => void
}

export function Sidebar({ onHomeClick }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <>
      <nav className="safe-bottom-nav fixed inset-x-0 bottom-0 z-20 border-t border-[#21262d] bg-[#07090d]/95 px-3 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between text-slate-400">
          <button
            type="button"
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className="grid h-11 w-11 place-items-center rounded-md text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <Home size={18} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <FileCode2 size={18} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Terminal size={18} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={18} />
          </span>
        </div>
      </nav>
      <aside className="hidden w-14 flex-col items-center border-r border-[#21262d] bg-[#07090d] py-6 text-slate-500 md:flex">
        <div className="mb-9 rounded-md border border-cyan-400/60 p-1 text-cyan-300 shadow-[0_0_18px_rgba(0,240,255,0.28)]">
          <ShieldCheck size={16} />
        </div>
        <div className="flex flex-1 flex-col gap-5">
          <button
            type="button"
            onClick={onHomeClick}
            aria-label={t('sidebar.returnInitialState')}
            className="grid h-11 w-11 place-items-center rounded-md text-cyan-300 transition hover:bg-cyan-400/10 hover:text-cyan-200"
          >
            <Home size={17} />
          </button>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <FileCode2 size={17} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Terminal size={17} />
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-md">
            <Settings size={17} />
          </span>
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(255,123,114,0.9)]" />
      </aside>
    </>
  )
}
