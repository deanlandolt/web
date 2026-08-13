import { defineConfig } from 'vitepress'
import { katex as katexPlugin } from '@mdit/plugin-katex'

// Site config for deanlandolt.com
// Deployed to GitHub Pages from the repo root (custom domain → base: '/')
//
// We use the NODE_ENV check so srcExclude can be conditional: uncommitted
// drafts (*.uncommitted.md) are gitignored and should be browsable in local
// dev but excluded entirely from production builds.
const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  lang: 'en-US',
  title: 'deanlandolt.com',
  description: 'Dean Landolt — deanlandolt.com',

  // Custom domain served from repo root, so base is '/'.
  base: '/',

  cleanUrls: true,

  // Keep authoring docs out of the page build — README.md is for humans
  // reading the repo, not a rendered page. In production, also exclude
  // uncommitted drafts (*.uncommitted.md) so no HTML pages are built for
  // them. In dev they remain browsable. Scratch/planning docs now live at
  // the repo root as .scratch/ (a hidden dotdir), outside this content root
  // entirely, so they need no srcExclude entry here.
  srcExclude: isDev
    ? ['**/README.md']
    : ['**/README.md', '**/*.uncommitted.md'],

  markdown: {
    // Smart typography: `--`→`—`, `...`→`…`, straight quotes→curly.
    // Built into markdown-it (VitePress's renderer) — no plugin needed.
    typographer: true,
    // KaTeX math rendering: $...$ inline, $$...$$ block.
    config: (md) => {
      md.use(katexPlugin)
    }
  },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    [
      'meta',
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    // Discreet early-web nod: keep things honest.
    ['meta', { name: 'generator', content: 'VitePress' }]
  ],

  themeConfig: {
    siteTitle: 'deanlandolt.com',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Notes', link: '/notes' },
      { text: 'Posts', link: '/posts' },
      { text: 'Quotes', link: '/quotes/' },
      { text: 'About', link: '/about' }
    ],

    outline: false,
    lastUpdated: false,
    darkModeSwitchLabel: '◐',
    sidebar: false,

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Search', buttonAriaLabel: 'Search' }
        }
      }
    }
  }
})
