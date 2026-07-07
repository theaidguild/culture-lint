import { useEffect, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

const HOLD_AFTER_LAST = 2400
const FADE_DURATION = 850

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

const STAGE_TIMINGS = prefersReducedMotion
  ? {
      atmosphere: 0,
      metadata: 450,
      title: 1050,
      subtitle: 1650,
      progress: 2250,
      log: 3000,
      status: 3800,
      timelineEnd: 3800,
      progressFill: 2200,
      lineStagger: 110,
    }
  : {
      atmosphere: 250,
      metadata: 900,
      title: 1700,
      subtitle: 2550,
      progress: 3400,
      log: 4300,
      status: 5350,
      timelineEnd: 5350,
      progressFill: 2600,
      lineStagger: 150,
    }

const BOOT_LOG_LINES_CONFIG = [
  { textKey: 'boot.logLines.stagingKeys', stateKey: 'boot.states.ok', tone: 'ok' },
  { textKey: 'boot.logLines.mountingDb', stateKey: 'boot.states.ok', tone: 'ok' },
  { textKey: 'boot.logLines.initEngine', stateKey: 'boot.states.ok', tone: 'ok' },
  { textKey: 'boot.logLines.scanningVectors', stateKey: 'boot.states.ok', tone: 'ok' },
  { textKey: 'boot.logLines.bypassingSafeguards', stateKey: 'boot.states.warning', tone: 'warn' },
  { textKey: 'boot.logLines.establishingCommlink', stateKey: 'boot.states.ok', tone: 'ok' },
  { textKey: 'boot.logLines.loadingProtocols', stateKey: '', tone: 'info' },
] as const

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation()
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [percent, setPercent] = useState(0)

  const bootStyle = {
    '--boot-atmosphere': `${STAGE_TIMINGS.atmosphere}ms`,
    '--boot-metadata': `${STAGE_TIMINGS.metadata}ms`,
    '--boot-title': `${STAGE_TIMINGS.title}ms`,
    '--boot-subtitle': `${STAGE_TIMINGS.subtitle}ms`,
    '--boot-progress': `${STAGE_TIMINGS.progress}ms`,
    '--boot-log': `${STAGE_TIMINGS.log}ms`,
    '--boot-status': `${STAGE_TIMINGS.status}ms`,
    '--boot-progress-fill-duration': `${STAGE_TIMINGS.progressFill}ms`,
    '--boot-line-stagger': `${STAGE_TIMINGS.lineStagger}ms`,
    '--boot-glow-loop-delay': `${STAGE_TIMINGS.title + 1500}ms`,
  } as CSSProperties

  useEffect(() => {
    let animationFrameId: number
    const startTimeOffset = STAGE_TIMINGS.progress
    const duration = STAGE_TIMINGS.progressFill
    let startTimestamp: number | null = null

    const updatePercent = (now: number) => {
      if (startTimestamp === null) {
        startTimestamp = now
      }
      const elapsed = now - startTimestamp
      if (elapsed < 0) {
        animationFrameId = requestAnimationFrame(updatePercent)
        return
      }

      const progressRatio = Math.min(1, elapsed / duration)
      // Smooth cubic out easing for percentage text sync
      const easedRatio = 1 - Math.pow(1 - progressRatio, 3)
      setPercent(Math.floor(easedRatio * 68))

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(updatePercent)
      }
    }

    const startTimeout = window.setTimeout(() => {
      startTimestamp = performance.now()
      animationFrameId = requestAnimationFrame(updatePercent)
    }, startTimeOffset)

    return () => {
      window.clearTimeout(startTimeout)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  useEffect(() => {
    const fadeTimeout = window.setTimeout(
      () => setIsFadingOut(true),
      STAGE_TIMINGS.timelineEnd + HOLD_AFTER_LAST
    )
    const safetyTimeout = window.setTimeout(
      onComplete,
      STAGE_TIMINGS.timelineEnd + HOLD_AFTER_LAST + FADE_DURATION + 350
    )

    return () => {
      window.clearTimeout(fadeTimeout)
      window.clearTimeout(safetyTimeout)
    }
  }, [onComplete])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t('boot.ariaLabel')}
      style={bootStyle}
      onTransitionEnd={(e) => {
        if (e.target === e.currentTarget && e.propertyName === 'opacity') {
          onComplete()
        }
      }}
      className={`boot-screen fixed inset-0 z-50 overflow-hidden bg-black ${
        isFadingOut ? 'opacity-0 pointer-events-none boot-fading-out' : 'opacity-100'
      }`}
    >
      <div className="boot-atmosphere pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,220,255,0.16),transparent_36%),radial-gradient(circle_at_85%_15%,rgba(53,123,201,0.14),transparent_36%)]" />
        <div className="boot-grid absolute inset-0 bg-[linear-gradient(0deg,rgba(0,140,170,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(0,140,170,0.09)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="boot-scanlines absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_54%,rgba(0,0,0,0.9))]" />
      </div>

      <div className="relative flex h-full w-full items-center justify-center px-5 py-8 sm:px-9 md:px-12">
        <div
          className="boot-metadata absolute left-5 right-5 top-6 flex transform-gpu items-start justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500 sm:left-12 sm:right-12 sm:top-12"
        >
          <div className="space-y-2">
            <p>ID: CL-992-0X</p>
            <p>TS: 2026.01.24.04:12</p>
          </div>
          <div className="space-y-2 text-right">
            <p>{t('boot.connection')}</p>
            <p>BITRATE: 1.2 GBPS</p>
          </div>
        </div>

        <section className="relative w-full max-w-4xl text-center">
          <div className="boot-title-glow-wrap pointer-events-none absolute left-1/2 top-[38%] h-52 w-[min(78vw,640px)] -translate-x-1/2 -translate-y-1/2 transform-gpu">
            <div className="boot-title-glow-pulse h-full w-full rounded-full bg-cyan-400/28 blur-[56px]" />
          </div>

          <h1 className="boot-title relative transform-gpu font-['Rajdhani'] text-[3.2rem] font-black uppercase tracking-[0.05em] text-cyan-300 drop-shadow-[0_0_24px_rgba(0,245,255,0.42)] sm:text-[5.4rem]">
            CULTURE-LINT
          </h1>

          <p className="boot-subtitle mx-auto mt-2 inline-flex transform-gpu items-center gap-4 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-300/90 sm:text-sm">
            <span className="h-px w-10 bg-cyan-300/70" />
            MORAL AUDIT PROTOCOL
            <span className="h-px w-10 bg-cyan-300/70" />
          </p>

          <div className="boot-progress-wrap mx-auto mt-14 w-[min(78vw,420px)] transform-gpu">
            <div className="h-4 overflow-hidden rounded-sm border border-cyan-400/30 bg-[#06121f] p-1">
              <div
                style={{ transform: `scaleX(${percent / 100})` }}
                className="boot-progress-fill h-full w-full origin-left transform-gpu bg-[repeating-linear-gradient(90deg,rgba(34,211,238,0.98)_0_6px,rgba(6,11,20,0.25)_6px_9px)] shadow-[0_0_16px_rgba(34,211,238,0.5)]"
              />
            </div>
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.16em] text-cyan-300/90">
              {t('boot.initCoreSystems', { percent })}
            </p>
          </div>

          <div className="boot-log mx-auto mt-10 w-[min(92vw,560px)] transform-gpu rounded border border-cyan-400/35 bg-[#0a1220]/70 px-5 py-4 text-left font-mono text-[11px] text-slate-400">
            {BOOT_LOG_LINES_CONFIG.map((line, index) => (
              <p
                key={`${line.textKey}-${index}`}
                className="boot-log-line mb-1 flex items-center gap-2"
                style={{ '--line-index': index } as CSSProperties}
              >
                <span className="text-slate-600">&gt;</span>
                <span className="text-slate-500">{t(line.textKey)}</span>
                {line.stateKey ? (
                  <span
                    className={
                      line.tone === 'warn'
                        ? 'font-bold text-amber-400'
                        : line.tone === 'ok'
                          ? 'font-bold text-cyan-300'
                          : 'font-bold text-slate-300'
                    }
                  >
                    {t(line.stateKey)}
                  </span>
                ) : null}
              </p>
            ))}
          </div>
        </section>
      </div>

      <div className="boot-status absolute inset-x-0 bottom-0 transform-gpu border-t border-cyan-400/20 bg-[#030710]/96 px-3 py-3 font-mono text-[10px] uppercase tracking-[0.13em] text-slate-500 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-cyan-300" />
            <span>SYS: {t('boot.sysStatus')}</span>
          </div>
          <span>ENCRYPTION: AES-256 ACTIVE</span>
          <span>USER: GUEST_ANONYMOUS</span>
          <span className="text-cyan-300">{t('boot.clearanceLevel')}</span>
          <span className="rounded-sm bg-cyan-300 px-2 py-0.5 font-bold text-[#071018]">{t('boot.topSecret')}</span>
        </div>
      </div>
    </div>
  )
}

export default BootScreen
