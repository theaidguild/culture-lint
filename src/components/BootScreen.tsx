import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type LineTone = 'info' | 'warn' | 'ok'

type BootLine = {
  delay: number
  tone: LineTone
  channel: string
  message: string
}

const HOLD_AFTER_LAST = 2000
const FADE_DURATION = 320

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

const TYPING_SPEED = prefersReducedMotion ? 22 : 20

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const bootLines = useMemo(() => buildBootLines(t), [t])
  const [typedLines, setTypedLines] = useState<string[]>(() => bootLines.map(() => ''))
  const [activeLineIndex, setActiveLineIndex] = useState(0)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const timers = useRef<number[]>([])
  const logContainerRef = useRef<HTMLDivElement | null>(null)

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

      const fadeTimeout = window.setTimeout(() => setIsFadingOut(true), HOLD_AFTER_LAST)
      const doneTimeout = window.setTimeout(onComplete, HOLD_AFTER_LAST + FADE_DURATION)
      timers.current.push(fadeTimeout, doneTimeout)
    }

    void run()

    return () => {
      timers.current.forEach((id) => window.clearTimeout(id))
      timers.current = []
    }
  }, [bootLines, onComplete])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    if (!isMobile) {
      return
    }

    const container = logContainerRef.current
    if (!container || container.scrollHeight <= container.clientHeight) {
      return
    }

    container.scrollTop = container.scrollHeight
  }, [typedLines, activeLineIndex])

  const sequenceComplete = typedLines.every((line, index) => line === bootLines[index].message)

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('boot.ariaLabel')}
      className={`boot-screen fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-[320ms] ease-out ${
        isFadingOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_10%,rgba(0,240,255,0.14),transparent_48%),radial-gradient(circle_at_82%_90%,rgba(47,129,247,0.15),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_3px] opacity-70" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.88))]" />

      <div className="relative flex h-full w-full items-center justify-center px-3 py-4 sm:px-6 sm:py-7 md:px-8 md:py-10">
        <section className="boot-terminal flex h-[430px] min-h-[430px] max-h-[430px] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-cyan-400/25 bg-[#03060c]/95 shadow-[0_0_48px_rgba(0,240,255,0.12)] sm:h-[500px] sm:min-h-[500px] sm:max-h-[500px] md:h-[560px] md:min-h-[560px] md:max-h-[560px]">
          <header className="flex items-center justify-between border-b border-cyan-400/20 bg-cyan-400/5 px-3 py-2.5 font-mono text-[11px] tracking-wide text-cyan-300 sm:px-4 sm:text-xs">
            <span>culture-lint://boot</span>
            <span className="text-slate-400">runtime init</span>
          </header>

          <div ref={logContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2.5 font-mono text-[12px] leading-[1.55] sm:px-3 sm:py-3 sm:text-[13px] md:text-sm">
            {bootLines.slice(0, activeLineIndex + 1).map((line, index) => {
              const styles = TONE_STYLES[line.tone]
              const typedMessage = typedLines[index]
              const isActiveLine = index === activeLineIndex && !sequenceComplete

              return (
                <div key={`${line.channel}-${index}`} className="mt-0.5 grid grid-cols-[auto_auto_1fr] items-start gap-x-1.5 gap-y-0.5 sm:gap-x-2">
                  <span className="text-[10px] text-slate-600 sm:text-[11px]">{timestamp(index)}</span>
                  <span className={`${styles.prompt} pt-[1px]`}>{line.tone === 'warn' ? '⚠' : '▸'}</span>
                  <div className="min-w-0 break-words">
                    <span className={styles.channel}>{line.channel}</span>
                    <span className="mx-1 text-slate-700">::</span>
                    <span className={styles.message}>
                      {typedMessage}
                      {isActiveLine && !prefersReducedMotion ? (
                        <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] animate-[bootCursor_900ms_step-end_infinite] bg-current align-baseline" />
                      ) : null}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 px-3 text-center font-mono text-[10px] tracking-wide text-slate-600 sm:text-xs">
        {t('appName')} v2026.3.2
      </div>

      <style>{`
        @keyframes bootCursor {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }

        @media (max-height: 560px) {
          .boot-screen {
            overflow-y: auto;
          }

          .boot-screen .boot-terminal {
            height: 420px;
            min-height: 420px;
            max-height: 420px;
          }
        }
      `}</style>
    </div>
  )
}

export default BootScreen
