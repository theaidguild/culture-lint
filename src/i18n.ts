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

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'pt-BR'
  }

  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage as (typeof SUPPORTED_LANGUAGES)[number])) {
    return storedLanguage
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