import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { AIScenarioStep } from '../components/AIScenarioStep'
import { TopBar } from '../components/TopBar'
import { type Principle } from '../types/linter'

export function AIPage() {
  const { t } = useTranslation()

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
    ],
    [t]
  )

  const progressItems = useMemo(
    () => [
      { label: t('aiScreen.countryLabel'), active: true, complete: false },
      { label: t('aiScreen.navLabel'), active: false, complete: false },
      { label: t('progress.judgment'), active: false, complete: false },
      { label: t('progress.sessionResults'), active: false, complete: false },
    ],
    [t]
  )

  return (
    <>
      <TopBar progressItems={progressItems} step={1} hasFailures={false} />
      <AIScenarioStep principles={principles} />
    </>
  )
}

export default AIPage
