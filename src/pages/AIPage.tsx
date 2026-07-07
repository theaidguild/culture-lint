import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AIScenarioStep, type AIHeaderStep } from '../components/AIScenarioStep'
import { TopBar } from '../components/TopBar'
import { type Principle } from '../types/linter'

export function AIPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState<AIHeaderStep>(1)
  const [hasFailures, setHasFailures] = useState(false)

  const principles = useMemo<Principle[]>(
    () => [
      {
        id: 'transparency',
        label: t('principles.transparency.label'),
        status: t('principles.transparency.status'),
        metadata: [
          t('principles.transparency.metadata.access'),
          t('principles.transparency.metadata.state'),
        ],
        value: t('principles.transparency.value'),
        code: 'CHK_012',
      },
      {
        id: 'accountability',
        label: t('principles.accountability.label'),
        status: t('principles.accountability.status'),
        metadata: [
          t('principles.accountability.metadata.resignation'),
          t('principles.accountability.metadata.state'),
        ],
        value: t('principles.accountability.value'),
        code: 'CHK_034',
      },
      {
        id: 'equality',
        label: t('principles.equality.label'),
        status: t('principles.equality.status'),
        metadata: [
          t('principles.equality.metadata.payGap'),
          t('principles.equality.metadata.state'),
        ],
        value: t('principles.equality.value'),
        code: 'CHK_088',
      },
      {
        id: 'religious-freedom',
        label: t('principles.religiousFreedom.label'),
        status: t('principles.religiousFreedom.status'),
        metadata: [
          t('principles.religiousFreedom.metadata.expression'),
          t('principles.religiousFreedom.metadata.state'),
        ],
        value: t('principles.religiousFreedom.value'),
        code: 'CHK_144',
      },
      {
        id: 'reproductive-autonomy',
        label: t('principles.reproductiveAutonomy.label'),
        status: t('principles.reproductiveAutonomy.status'),
        metadata: [
          t('principles.reproductiveAutonomy.metadata.healthcare'),
          t('principles.reproductiveAutonomy.metadata.state'),
        ],
        value: t('principles.reproductiveAutonomy.value'),
        code: 'CHK_155',
      },
    ],
    [t]
  )

  const progressItems = useMemo(
    () => [
      { label: t('aiScreen.stepConfigure'), active: step === 1, complete: step > 1 },
      { label: t('aiScreen.stepGenerate'), active: step === 2, complete: step > 2 },
      { label: t('aiScreen.stepJudge'), active: step === 3, complete: step > 3 },
      { label: t('aiScreen.stepReport'), active: step === 4, complete: false },
    ],
    [step, t]
  )

  return (
    <>
      <TopBar progressItems={progressItems} step={step} hasFailures={hasFailures} />
      <AIScenarioStep
        principles={principles}
        onStepChange={setStep}
        onHasFailures={setHasFailures}
      />
    </>
  )
}

export default AIPage
