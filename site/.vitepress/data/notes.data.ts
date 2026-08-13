import { createContentLoader } from 'vitepress'

// True in `pnpm dev`, false in `pnpm build` (production). The data loader
// transform runs in Node, so we check process.env rather than import.meta.env
// (which is undefined in this context).
const isDev = process.env.NODE_ENV !== 'production'

/**
 * Notes loader — the lightweight content backbone.
 *
 * Drop any markdown file into site/notes/ and it appears here automatically.
 * Frontmatter conventions (all optional):
 *   title:      note title (falls back to first H1 / filename)
 *   draft:      true to hide a note from the index
 *   tags:       list of strings, e.g. [software, unix]
 *   chapter:    loose organizing principle (e.g. "ch2") — not a hard order;
 *               multiple notes can share a chapter, and chapters are fodder
 *               bins rather than rigid sections
 *   created:    ISO date string (YYYY-MM-DD) — the original vault creation
 *               date, when known. Notes are living documents (not blog posts)
 *               so this is metadata, not a publish date, and does not drive
 *               sort order
 *   redirects:  list of old slug strings — when a note is renamed, list the
 *               previous slug(s) here so the data loader can emit redirect
 *               rules automatically, keeping URLs stable
 *
 * Notes are living documents, not blog posts. They have no publish date and
 * are not ordered chronologically. For now they're sorted alphabetically by
 * title — a neutral default until a more deliberate organizing principle
 * (e.g. a chapter/order field) emerges. Tags drive client-side filtering in
 * the index component.
 *
 * Uncommitted drafts use the `.uncommitted.md` suffix (gitignored — never
 * committed). They are included in the index ONLY during local dev, never in
 * production builds, so they stay private while remaining browsable. In
 * production, config.ts also excludes them via srcExclude so no HTML pages
 * are built for them at all.
 *
 * Scratch docs (planning/working documents that are never content) live at the
 * repo root in .scratch/ — outside VitePress's content root (site/) entirely,
 * so they never appear in any content glob regardless of dev/prod.
 *
 * Note: the glob `notes/*.md` matches `*.uncommitted.md` files too (they end
 * in .md), so we filter them out in the transform when !isDev.
 */
export interface NoteItem {
  url: string
  title: string
  excerpt?: string
  tags?: string[]
  draft?: boolean
  uncommitted?: boolean
  // Editorial triage tier — ready | needs-work | thin | fragments. Purely
  // informational metadata; surfaced as a dev-only badge in the notes index.
  status?: string
  chapter?: string
  created?: string
  redirects?: string[]
}

export interface NoteData {
  items: NoteItem[]
}

export default createContentLoader('notes/*.md', {
  // excerpt: true would require explicit <!-- more --> markers; we infer from
  // the first paragraph instead in the component, so leave this off.
  render: false,
  transform(raw): NoteData {
    const items = raw
      .map(({ url, frontmatter, excerpt }) => ({
        url,
        title: (frontmatter.title as string) || urlToTitle(url),
        excerpt: (excerpt as string) || undefined,
        tags: (frontmatter.tags as string[]) || undefined,
        draft: Boolean(frontmatter.draft),
        uncommitted: url.includes('.uncommitted'),
        status: (frontmatter.status as string) || undefined,
        chapter: (frontmatter.chapter as string) || undefined,
        created: (frontmatter.created as string) || undefined,
        redirects: (frontmatter.redirects as string[]) || undefined
      }))
      .filter((n) => !n.draft)
      // Exclude the notes index page itself — it's the listing, not a note.
      .filter((n) => !n.url.endsWith('/notes/') && !n.url.endsWith('/notes'))
      // Uncommitted drafts are only shown in local dev.
      .filter((n) => isDev || !n.uncommitted)
      // No dates — sort alphabetically by title for now. A neutral default
      // until a deliberate organizing principle (chapters, order field)
      // emerges. Case-insensitive, with a tiebreak on URL for stability.
      .sort((a, b) => {
        const t = a.title.localeCompare(b.title, undefined, {
          sensitivity: 'base'
        })
        return t !== 0 ? t : a.url.localeCompare(b.url)
      })

    return { items }
  }
})

function urlToTitle(url: string): string {
  // /notes/my-post → "my post"  (also strips ".uncommitted")
  const slug = url.split('/').filter(Boolean).pop() || url
  return slug
    .replace(/\.html$/, '')
    .replace(/\.uncommitted$/, '')
    .replace(/[-_]/g, ' ')
}
