// .vitepress/theme/index.js
import { h } from 'vue'
import DefaultTheme from 'vitepress/theme'
import AccessibilityEnhancements from './components/AccessibilityEnhancements.vue'
import './syntax-contrast.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(AccessibilityEnhancements)
    })
  },
  enhanceApp({ app }) {
    app.component('AccessibilityEnhancements', AccessibilityEnhancements)
  }
}