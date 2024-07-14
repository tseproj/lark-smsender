import { bitable } from '@lark-base-open/js-sdk'
import { onMounted, ref } from 'vue'

export function useTheme() {
  const theme = ref('')

  function setThemeColor() {
    const el = document.documentElement

    if (theme.value === 'DARK') {
      document.body.setAttribute('arco-theme', 'dark')
      el.style.setProperty('color', '#fff')
      el.style.setProperty('background-color', '#1A1A1A')
    }
    else if (theme.value === 'LIGHT') {
      document.body.removeAttribute('arco-theme')
      el.style.setProperty('color', '#434343')
      el.style.setProperty('background-color', '#fff')
    }
  }

  onMounted(async () => {
    theme.value = await bitable.bridge.getTheme()
    setThemeColor()
  })

  bitable.bridge.onThemeChange((event) => {
    theme.value = event.data.theme
    setThemeColor()
  })

  return { theme }
}
