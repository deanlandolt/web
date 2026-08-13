// Dynamic-routes paths loader for /quotes/by/[author].
//
// Generates one page per author, listing all quotes attributed to them.
// VitePress builds these at build time from the [author].md template — no
// markdown files on disk. We read quotes.yaml, group by author, and emit one
// path entry per author with frontmatter (params) and pre-rendered markdown
// body (content).
//
// See: https://vitepress.dev/guide/routing#dynamic-routes

import {
  loadQuotes,
  slugifyValue,
  formatCirca,
  quoteTitle
} from '../quotes-db.mjs'

export default {
  watch: ['../quotes.yaml'],
  paths() {
    const quotes = loadQuotes()

    // Group quotes by author, preserving first-appearance order.
    const byAuthor = new Map() // author → { slug, quotes: [] }
    for (const q of quotes) {
      const slug = slugifyValue(q.author)
      if (!byAuthor.has(q.author)) {
        byAuthor.set(q.author, { slug, quotes: [] })
      }
      byAuthor.get(q.author).quotes.push(q)
    }

    return [...byAuthor.entries()].map(([author, { slug, quotes }]) => {
      // Build the markdown body: an H1 with the author name, then each quote
      // as a blockquote linking to its individual page.
      const lines = []
      lines.push(`# ${author}`, '')
      lines.push(
        `${quotes.length} quote${quotes.length === 1 ? '' : 's'} attributed to ${author}.`,
        ''
      )

      for (const q of quotes) {
        const body = q.text.replace(/\n/g, '  \n')
        lines.push(`> ${body}`)
        lines.push('>')
        const meta = [`— [${q.title}](${q.url})`]
        if (q.circa !== undefined) meta.push(formatCirca(q.circa))
        if (q.work) meta.push(`*${q.work}*`)
        lines.push(`> ${meta.join(' · ')}`, '')
      }

      lines.push('[← All quotes](/quotes/)')

      return {
        params: { author: slug },
        content: lines.join('\n')
      }
    })
  }
}
