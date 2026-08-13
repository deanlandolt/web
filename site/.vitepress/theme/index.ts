import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'katex/dist/katex.min.css'
import './style.css'
import './notes.css'
import './posts.css'
import QuoteRef from '../components/QuoteRef.vue'

// Register QuoteRef globally so any markdown page can use <QuoteRef slug="..." />
// without a per-page <script setup> import.
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuoteRef', QuoteRef)
  }
} satisfies Theme
