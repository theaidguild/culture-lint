import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import enUS from './locales/en-US'
import ptBR from './locales/pt-BR'

const LANGUAGE_STORAGE_KEY = 'culture-lint.language'
const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US'] as const

const resources = {
  'pt-BR': ptBR,
  'en-US': enUS,
} as const

const isSupportedLanguage = (
  language: string
): language is (typeof SUPPORTED_LANGUAGES)[number] => {
  return SUPPORTED_LANGUAGES.includes(language as (typeof SUPPORTED_LANGUAGES)[number])
}

const resolveSupportedLanguage = (language: string | null | undefined) => {
  if (!language) {
    return null
  }

  if (isSupportedLanguage(language)) {
    return language
  }

  const baseLanguage = language.split('-')[0]?.toLowerCase()
  if (baseLanguage === 'pt') {
    return 'pt-BR'
  }

  if (baseLanguage === 'en') {
    return 'en-US'
  }

  return null
}

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'pt-BR'
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const resolvedStoredLanguage = resolveSupportedLanguage(storedLanguage)
  if (resolvedStoredLanguage) {
    return resolvedStoredLanguage
  }

  const browserLanguages = [window.navigator.language, ...(window.navigator.languages ?? [])]
  for (const browserLanguage of browserLanguages) {
    const resolvedBrowserLanguage = resolveSupportedLanguage(browserLanguage)
    if (resolvedBrowserLanguage) {
      return resolvedBrowserLanguage
    }
  }

  return 'pt-BR'
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'pt-BR',
  supportedLngs: SUPPORTED_LANGUAGES,
  load: 'currentOnly',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
})

export default i18n
