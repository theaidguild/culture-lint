import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ChevronDown, GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { type Principle } from '../types/linter'
import { formatPrincipleLabel } from '../utils/text'

interface RankingStepProps {
  principles: Principle[]
  onReorder: (nextOrder: string[]) => void
  onNext: () => void
}

export function RankingStep({ principles, onReorder, onNext }: RankingStepProps) {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const orderIds = principles.map((principle) => principle.id)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = orderIds.indexOf(String(active.id))
    const newIndex = orderIds.indexOf(String(over.id))
    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onReorder(arrayMove(orderIds, oldIndex, newIndex))
  }

  const move = (id: string, direction: -1 | 1) => {
    const index = orderIds.indexOf(id)
    const target = index + direction
    if (index === -1 || target < 0 || target >= orderIds.length) {
      return
    }

    onReorder(arrayMove(orderIds, index, target))
  }

  return (
    <div className="flex flex-1 items-start px-4 py-8 sm:px-6 lg:px-20">
      <div className="w-full max-w-4xl">
        <div className="mb-8 font-mono text-xs text-slate-500 sm:mb-10">
          {t('rank.progress')}
          <div className="mt-3 flex gap-2">
            <span className="h-0.5 w-10 bg-cyan-400" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
            <span className="h-0.5 w-10 bg-[#30363d]" />
          </div>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-5xl">
          {t('rank.title')}
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-400">{t('rank.description')}</p>
        <p className="mt-3 font-mono text-xs text-cyan-300">{t('rank.hint')}</p>

        <div className="mt-8 flex items-center justify-between font-mono text-xs text-slate-500 sm:mt-10">
          <span className="text-emerald-400">↑ {t('rank.mostImportant')}</span>
          <span className="text-red-400">↓ {t('rank.leastImportant')}</span>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderIds} strategy={verticalListSortingStrategy}>
            <ul className="mt-3 space-y-4">
              {principles.map((principle, index) => (
                <SortablePrincipleRow
                  key={principle.id}
                  principle={principle}
                  rank={index + 1}
                  isFirst={index === 0}
                  isLast={index === principles.length - 1}
                  onMoveUp={() => move(principle.id, -1)}
                  onMoveDown={() => move(principle.id, 1)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="mt-10 flex justify-end sm:mt-12">
          <button
            type="button"
            onClick={onNext}
            className="w-full rounded-md bg-cyan-400 px-8 py-4 font-mono text-xs font-black text-[#071018] shadow-[0_0_30px_rgba(0,240,255,0.42)] transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
          >
            {t('rank.next')}
          </button>
        </div>
      </div>
    </div>
  )
}

interface SortablePrincipleRowProps {
  principle: Principle
  rank: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortablePrincipleRow({
  principle,
  rank,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
}: SortablePrincipleRowProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: principle.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-stretch gap-3 rounded-xl border bg-[#161b22] p-4 transition sm:p-5 ${
        isDragging ? 'border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.25)]' : 'border-[#21262d]'
      }`}
    >
      <button
        type="button"
        aria-label={t('rank.dragHandle')}
        className="flex shrink-0 cursor-grab touch-none items-center rounded-md px-1 text-slate-500 transition hover:text-cyan-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={20} />
      </button>
      <div className="flex shrink-0 flex-col items-center justify-center">
        <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-400/60 font-mono text-sm font-black text-cyan-300">
          {rank}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-sm font-black text-cyan-300">
            {formatPrincipleLabel(principle.label)}
          </span>
          <span className="font-mono text-xs text-slate-500">{t('rank.rankLabel', { rank })}</span>
        </div>
        <p className="mt-2 text-sm italic leading-6 text-slate-200">
          &quot;{principle.value}&quot;
        </p>
      </div>
      <div className="flex shrink-0 flex-col justify-center gap-1">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          aria-label={t('rank.moveUp')}
          className="grid h-8 w-8 place-items-center rounded-md border border-[#30363d] text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown size={15} className="rotate-180" />
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          aria-label={t('rank.moveDown')}
          className="grid h-8 w-8 place-items-center rounded-md border border-[#30363d] text-slate-400 transition hover:border-cyan-400/60 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown size={15} />
        </button>
      </div>
    </li>
  )
}
