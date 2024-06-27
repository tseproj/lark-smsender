import { createApp } from 'vue'
import { bitable } from '@lark-base-open/js-sdk'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  locale: 'zh',
  allowComposition: true,
  fallbackLocale: 'en',
  fallbackWarn: false,
  formatFallbackMessages: true,
  legacy: false,
  messages: {
    'id': {},
    'de': {},
    en,
    'es': {},
    'fr': {},
    'hi': {},
    'it': {},
    ja,
    'ko': {},
    'pt': {},
    'ru': {},
    'th': {},
    'vi': {},
    zh,
    'zh-HK': {},
    'zh-TW': {},
  },
  missingWarn: false,
  silentFallbackWarn: true,
  silentTranslationWarn: true,
})

bitable.bridge.getLanguage().then((language) => {
  i18n.global.locale.value = language
})

const app = createApp(App)

app.use(i18n)

app.mount('#app')
