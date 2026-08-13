// Dynamic-routes paths loader for /quotes/[slug].
//
// VitePress calls this at build time (and in dev) to discover which slug pages
// to generate. We read quotes.yaml, compute slugs, and return one entry per
// quote with its frontmatter (as params) and pre-rendered markdown body (as
// content). VitePress then generates one static HTML page per quote from the
// single [slug].md template — no 33 generated markdown files on disk.
//
// See: https://vitepress.dev/guide/routing#dynamic-routes

import { loadQuotes, quoteFrontmatter, quotePageContent } from './quotes-db.mjs'

export default {
  // Rebuild quote pages when the YAML changes (dev server HMR).
  watch: ['./quotes.yaml'],
  paths() {
    const quotes = loadQuotes()
    return quotes.map((q) => ({
      params: { slug: q.slug, ...quoteFrontmatter(q) },
      content: quotePageContent(q)
    }))
  }
}
