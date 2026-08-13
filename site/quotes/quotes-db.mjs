// Shared quote logic — the single home for slug generation, title derivation,
// and YAML loading.
//
// Imported by:
//   - scripts/gen-quotes.mjs         (writes quotes.generated.json for the
//                                     browser: index, QuoteRef, RotatingQuote)
//   - site/quotes/[slug].paths.js    (VitePress dynamic routes loader —
//                                     generates one page per quote at build time)
//
// Both run in Node at build time, so we use fs + js-yaml directly. This keeps
// quotes.yaml as the only hand-maintained source of truth and guarantees the
// slugs are identical everywhere.

import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as yaml from 'js-yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * URL-safe slug from a title string.
 * Lowercases, strips non-alphanumerics, joins words with hyphens.
 * Deterministic; collisions (same title) are disambiguated with a counter
 * in loadQuotes().
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join('-')
  return slug || 'untitled'
}

/**
 * Derive a display title for a quote.
 * If the quote has an explicit `title` in the YAML, use it. Otherwise fall
 * back to "{author} on {category}" — always sensible, never awkward.
 * @param {object} q
 * @returns {string}
 */
export function quoteTitle(q) {
  if (q.title) return q.title
  return `${q.author} on ${q.category}`
}

/**
 * Load quotes.yaml, compute titles, slugs (with collision handling), and
 * return the canonical array. Each quote object has its original YAML fields
 * plus a computed `title`, `slug`, and `url`.
 * @param {string} [yamlPath]
 * @returns {Array<object>}
 */
export function loadQuotes(yamlPath) {
  const path = yamlPath || join(__dirname, 'quotes.yaml')
  const raw = yaml.load(readFileSync(path, 'utf8'))

  const slugCounts = new Map()
  return raw.map((q) => {
    const title = quoteTitle(q)
    let slug = slugify(title)
    if (slugCounts.has(slug)) {
      const n = slugCounts.get(slug) + 1
      slugCounts.set(slug, n)
      slug = `${slug}-${n}`
    } else {
      slugCounts.set(slug, 1)
    }
    return { ...q, title, slug, url: `/quotes/${slug}` }
  })
}

/**
 * URL-safe slug from an arbitrary string (author name, category, etc.).
 * Same algorithm as slugify() but exposed separately for clarity at call
 * sites — we're slugifying a person's name or a category label, not a title.
 * @param {string} text
 * @returns {string}
 */
export function slugifyValue(text) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .join('-') || 'untitled'
  )
}

/**
 * Format a circa value for display, avoiding a double "c." prefix when the
 * value already starts with "c." or is a BCE string.
 * @param {string | number} circa
 * @returns {string}
 */
export function formatCirca(circa) {
  const s = String(circa)
  return /^(c\.|~|ca\.|before|after)/i.test(s) || /BCE/i.test(s) ? s : `c. ${s}`
}

/**
 * Build the markdown body for a quote page — used by the dynamic-routes paths
 * loader to pass as the `content` property.
 *
 * Layout: the title is the H1 (sensible, searchable). The quote itself renders
 * as a blockquote pull-quote — the visual centerpiece. Metadata (work, circa,
 * context, note) follows. Poetry line breaks are preserved via markdown hard
 * breaks (two trailing spaces).
 * @param {object} q
 * @returns {string}
 */
export function quotePageContent(q) {
  const title = quoteTitle(q)
  const quoteBody = q.text.replace(/\n/g, '  \n')
  const authorSlug = slugifyValue(q.author)
  const categorySlug = slugifyValue(q.category)
  const lines = []

  // H1 — the page title (author + topic), not the quote itself.
  lines.push(`# ${title}`, '')

  // The quote as a pull-quote blockquote.
  lines.push(`> ${quoteBody}`)
  lines.push(`>`)
  // Author links to the per-author listing page; the dagger (†) links to
  // the external source for attribution verification.
  lines.push(
    `> — [${q.author}](/quotes/by/${authorSlug} "All quotes by ${q.author}") [†](${q.source} "Verify attribution — ${q.source}")`
  )

  const meta = []
  if (q.work) meta.push(`*${q.work}*`)
  if (q.circa !== undefined) meta.push(formatCirca(q.circa))
  if (q.context) meta.push(q.context)
  if (q.note) meta.push(`_Note: ${q.note}_`)
  // Category links to the per-category listing page.
  meta.push(
    `[${q.category}](/quotes/in/${categorySlug} "All ${q.category} quotes")`
  )
  if (meta.length) lines.push('', meta.join(' · '))

  lines.push('', '[← All quotes](/quotes/)')
  return lines.join('\n')
}

/**
 * Frontmatter for a quote page — passed as `params` by the paths loader so
 * VitePress builds proper <title>, search indexing, etc.
 * @param {object} q
 * @returns {object}
 */
export function quoteFrontmatter(q) {
  const title = quoteTitle(q)
  const fm = {
    title,
    author: q.author,
    source: q.source,
    category: q.category
  }
  if (q.circa !== undefined) fm.circa = q.circa
  if (q.context) fm.context = q.context
  if (q.work) fm.work = q.work
  if (q.note) fm.note = q.note
  return fm
}
