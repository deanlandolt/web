// Dynamic-routes paths loader for /quotes/in/[category].
//
// Generates one page per category, listing all quotes in that category.
// VitePress builds these at build time from the [category].md template.
// We read quotes.yaml, group by category, and emit one path entry per
// category with frontmatter (params) and pre-rendered markdown body (content).
//
// See: https://vitepress.dev/guide/routing#dynamic-routes

import { loadQuotes, slugifyValue, formatCirca } from '../quotes-db.mjs'

export default {
  watch: ['../quotes.yaml'],
  paths() {
    const quotes = loadQuotes()

    // Group quotes by category, preserving first-appearance order.
    const byCategory = new Map() // category → { slug, display, quotes: [] }
    for (const q of quotes) {
      const slug = slugifyValue(q.category)
      if (!byCategory.has(q.category)) {
        byCategory.set(q.category, { slug, quotes: [] })
      }
      byCategory.get(q.category).quotes.push(q)
    }

    return [...byCategory.entries()].map(([category, { slug, quotes }]) => {
      // Build the markdown body: an H1 with the category name, then each
      // quote as a blockquote linking to its individual page.
      const lines = []
      lines.push(`# ${category}`, '')
      lines.push(
        `${quotes.length} quote${quotes.length === 1 ? '' : 's'} in the ${category} category.`,
        ''
      )

      for (const q of quotes) {
        const body = q.text.replace(/\n/g, '  \n')
        lines.push(`> ${body}`)
        lines.push('>')
        const meta = [`— [${q.title}](${q.url})`]
        meta.push(q.author)
        if (q.circa !== undefined) meta.push(formatCirca(q.circa))
        lines.push(`> ${meta.join(' · ')}`, '')
      }

      lines.push('[← All quotes](/quotes/)')

      return {
        params: { category: slug },
        content: lines.join('\n')
      }
    })
  }
}
