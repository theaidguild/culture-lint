import { Trans, useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const cl = <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-cyan-300" />
const str = <strong className="text-slate-100" />
const em = <em className="text-slate-200" />

const STEPS = [
  { labelKey: 'about.step1Label', descKey: 'about.step1Desc' },
  { labelKey: 'about.step2Label', descKey: 'about.step2Desc' },
  { labelKey: 'about.step3Label', descKey: 'about.step3Desc' },
  { labelKey: 'about.step4Label', descKey: 'about.step4Desc' },
]

export function AboutPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-12">
      <div className="mb-8 sm:mb-10">
        <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/70">
          {t('about.eyebrow')}
        </p>
        <h1 className="text-2xl font-bold text-slate-100 sm:text-3xl xl:text-4xl">
          {t('about.title')}
        </h1>
      </div>

      <div className="space-y-6 text-base leading-relaxed text-slate-300 sm:text-lg">
        <p>
          <Trans i18nKey="about.intro" components={{ cl, str }} />
        </p>

        <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-4 text-slate-300">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
            {t('about.calloutLabel')}
          </p>
          <p>
            <Trans i18nKey="about.calloutBody" components={{ cl, str, em }} />
          </p>
        </div>

        <p>
          <Trans i18nKey="about.insightBody" components={{ cl, str }} />
        </p>

        <p>
          <Trans i18nKey="about.engineBody" components={{ str }} />
        </p>

        <div>
          <p className="mb-4">{t('about.wizardIntro')}</p>
          <ol className="space-y-4 pl-1">
            {STEPS.map(({ labelKey, descKey }, i) => (
              <li key={labelKey} className="flex gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 font-mono text-[11px] text-cyan-300">
                  {i + 1}
                </span>
                <span>
                  <strong className="text-slate-100">{t(labelKey)}</strong>
                  {' — '}
                  <Trans i18nKey={descKey} components={{ str }} />
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="my-10 h-px bg-[#21262d]" />

      <div className="space-y-5 text-base leading-relaxed text-slate-300 sm:text-lg">
        <h2 className="text-xl font-bold text-slate-100 sm:text-2xl">{t('about.whyTitle')}</h2>
        <p>{t('about.whyPara1')}</p>
        <p className="font-semibold text-slate-100">
          <Trans i18nKey="about.whyForces" components={{ cl }} />
        </p>
        <p>
          <Trans i18nKey="about.whyMotivation" components={{ str }} />
        </p>
        <p>
          <Trans i18nKey="about.whyBdd" components={{ cl }} />
        </p>
        <p>{t('about.whyGoal')}</p>
      </div>

      <div className="mt-10 flex justify-start sm:mt-12">
        <Link
          to="/"
          className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
        >
          {t('about.backToMain')}
        </Link>
      </div>
    </div>
  )
}

export default AboutPage
