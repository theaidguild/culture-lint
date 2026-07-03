import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type LineTone = 'info' | 'warn' | 'ok'

type BootLine = {
  delay: number
  tone: LineTone
  channel: string
  message: string
}

const HOLD_AFTER_LAST = 320
const FADE_DURATION = 220

const TONE_STYLES: Record<LineTone, { channel: string; message: string; prompt: string }> = {
  info: { channel: 'text-slate-500', message: 'text-slate-300', prompt: 'text-cyan-400' },
  warn: { channel: 'text-amber-400/80', message: 'text-amber-400', prompt: 'text-amber-400' },
  ok: { channel: 'text-emerald-400/80', message: 'text-emerald-300', prompt: 'text-emerald-400' },
}

function timestamp(index: number): string {
  const value = (0.001 + index * 0.037 + (index % 3) * 0.004).toFixed(3)
  return `[${value}s]`
}

function buildBootLines(t: (key: string, options?: Record<string, string>) => string): BootLine[] {
  return [
    { delay: 28, tone: 'info', channel: 'system.core', message: t('boot.lines.coldBoot') },
    { delay: 34, tone: 'info', channel: 'mem.alloc', message: t('boot.lines.reserveHeap', { heap: '4096MB' }) },
    { delay: 32, tone: 'info', channel: 'mem.alloc', message: t('boot.lines.mapSpace') },
    { delay: 36, tone: 'info', channel: 'net.link', message: t('boot.lines.stabilizeMetrics') },
    { delay: 34, tone: 'info', channel: 'net.link', message: t('boot.lines.handshakeStream') },
    { delay: 36, tone: 'info', channel: 'logic.core', message: t('boot.lines.loadValidators') },
    { delay: 34, tone: 'info', channel: 'logic.core', message: t('boot.lines.compileRuleset') },
    { delay: 36, tone: 'info', channel: 'config.parse', message: t('boot.lines.readManifest') },
    { delay: 100, tone: 'warn', channel: 'config.parse', message: t('boot.lines.deprecatedModule', { module: 'universal_empathy' }) },
    { delay: 32, tone: 'warn', channel: 'config.parse', message: t('boot.lines.stripModule', { module: 'universal_empathy' }) },
    { delay: 40, tone: 'info', channel: 'logic.core', message: t('boot.lines.rebindValidators') },
    { delay: 36, tone: 'info', channel: 'engine.init', message: t('boot.lines.mountEngine') },
    { delay: 42, tone: 'ok', channel: 'engine.init', message: t('boot.lines.engineOnline') },
  ]
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

const TYPING_SPEED = prefersReducedMotion ? 14 : 9

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const bootLines = useMemo(() => buildBootLines(t), [t])
  const [typedLines, setTypedLines] = useState<string[]>(() => bootLines.map(() => ''))
  const [activeLineIndex, setActiveLineIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const run = async () => {
      await new Promise<void>((resolve) => {
        const startTimeout = window.setTimeout(resolve, 0)
        timers.current.push(startTimeout)
      })

      setTypedLines(bootLines.map(() => ''))
      setActiveLineIndex(0)
      setIsFadingOut(false)

      for (let lineIndex = 0; lineIndex < bootLines.length; lineIndex += 1) {
        setActiveLineIndex(lineIndex)

        const message = bootLines[lineIndex].message
        const delay = TYPING_SPEED

        for (let charIndex = 0; charIndex <= message.length; charIndex += 1) {
          const timeout = window.setTimeout(() => {
            setTypedLines((currentLines) => {
              const nextLines = [...currentLines]
              nextLines[lineIndex] = message.slice(0, charIndex)
              return nextLines
            })
          }, charIndex * delay)
          timers.current.push(timeout)
        }

        const lineDuration = message.length * delay
        const settleTimeout = window.setTimeout(() => {
          setTypedLines((currentLines) => {
            const nextLines = [...currentLines]
            nextLines[lineIndex] = message
            return nextLines
          })
        }, lineDuration + 20)
        timers.current.push(settleTimeout)

        await new Promise<void>((resolve) => {
          const nextLineTimeout = window.setTimeout(resolve, lineDuration + 18)
          timers.current.push(nextLineTimeout)
        })
      }

      const holdAfterLast = HOLD_AFTER_LAST
      const fadeDuration = FADE_DURATION
      const fadeTimeout = window.setTimeout(() => setIsFadingOut(true), holdAfterLast)
      const doneTimeout = window.setTimeout(onComplete, holdAfterLast + fadeDuration)
      timers.current.push(fadeTimeout, doneTimeout)
    }

    void run()

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [bootLines, onComplete])

  const sequenceComplete = typedLines.every((line, index) => line === bootLines[index].message)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('boot.ariaLabel')}
      className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[420ms] ease-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_3px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.85))]" />

      <div className="relative h-full w-full px-6 py-8 font-mono text-[12px] leading-[1.65] sm:px-10 sm:text-[13px] lg:px-16">
        <div className="flex max-w-3xl flex-col">
          {bootLines.slice(0, activeLineIndex + 1).map((line, index) => {
            const styles = TONE_STYLES[line.tone]
            const typedMessage = typedLines[index]
            const isActiveLine = index === activeLineIndex && !sequenceComplete

            return (
              <div key={`${line.channel}-${index}`} className="flex items-baseline gap-2 whitespace-pre">
                <span className="text-slate-700">{timestamp(index)}</span>
                <span className={styles.prompt}>{line.tone === 'warn' ? '⚠' : '▸'}</span>
                <span className={styles.channel}>{line.channel}</span>
                <span className="text-slate-700">::</span>
                <span className={styles.message}>
                  {typedMessage}
                  {isActiveLine && !prefersReducedMotion ? (
                    <span className="ml-0.5 inline-block h-[1em] w-[0.55em] translate-y-[0.12em] animate-[bootCursor_900ms_step-end_infinite] bg-current align-baseline" />
                  ) : null}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        @keyframes bootCursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default BootScreen
