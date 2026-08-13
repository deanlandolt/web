import { createContentLoader } from 'vitepress'

// True in `pnpm dev`, false in `pnpm build` (production). The data loader
// transform runs in Node, so we check process.env rather than import.meta.env
// (which is undefined in this context).
const isDev = process.env.NODE_ENV !== 'production'

/**
 * Posts loader — the chronological content stream.
 *
 * Drop any markdown file into site/posts/ and it appears here automatically.
 * Frontmatter conventions:
 *   title:      post title (falls back to first H1 / filename)
 *   date:       ISO date string (YYYY-MM-DD) — REQUIRED for posts. This is the
 *               publish date and drives sort order (newest first). Unlike notes,
 *               posts are dated, chronological, once-and-done — not living
 *               documents.
 *   tags:       list of strings, e.g. [software, rant]
 *   draft:      true to hide a post from the index
 *   excerpt:    optional short summary
 *
 * Posts are the opposite of notes: they have a publish date, are ordered
 * chronologically (newest first), and are finished things — essays,
 * announcements, reactions, rants-in-the-moment. Where notes are evergreen
 * reference material you keep refining, posts are timestamped and left alone.
 *
 * Uncommitted drafts use the `.uncommitted.md` suffix (gitignored — never
 * committed). They are included in the index ONLY during local dev, never in
 * production builds, so they stay private while remaining browsable. In
 * production, config.ts also excludes them via srcExclude so no HTML pages
 * are built for them at all.
 *
 * Note: the glob `posts/*.md` matches `*.uncommitted.md` files too (they end
 * in .md), so we filter them out in the transform when !isDev.
 */
export interface PostItem {
  url: string
  title: string
  date: string
  excerpt?: string
  tags?: string[]
  draft?: boolean
  uncommitted?: boolean
  // Editorial triage tier — surfaced as a dev-only badge in the posts index.
  status?: string
}

export interface PostData {
  items: PostItem[]
}

export default createContentLoader('posts/*.md', {
  // excerpt: true would require explicit <!-- more --> markers; we infer from
  // the first paragraph instead in the component, so leave this off.
  render: false,
  transform(raw): PostData {
    const items = raw
      .map(({ url, frontmatter, excerpt }) => ({
        url,
        title: (frontmatter.title as string) || urlToTitle(url),
        date: (frontmatter.date as string) || '',
        excerpt: (excerpt as string) || undefined,
        tags: (frontmatter.tags as string[]) || undefined,
        draft: Boolean(frontmatter.draft),
        uncommitted: url.includes('.uncommitted'),
        status: (frontmatter.status as string) || undefined
      }))
      .filter((p) => !p.draft)
      // Exclude the posts index page itself — it's the listing, not a post.
      .filter((p) => !p.url.endsWith('/posts/') && !p.url.endsWith('/posts'))
      // Uncommitted drafts are only shown in local dev.
      .filter((p) => isDev || !p.uncommitted)
      // Posts are chronological — newest first. Undated posts (no `date`
      // frontmatter) sink to the bottom and sort by title among themselves,
      // since a post without a date is arguably malformed but we'd rather
      // not silently drop it.
      .sort((a, b) => {
        if (a.date && b.date) return b.date.localeCompare(a.date)
        if (a.date) return -1
        if (b.date) return 1
        return a.title.localeCompare(b.title, undefined, {
          sensitivity: 'base'
        })
      })

    return { items }
  }
})

function urlToTitle(url: string): string {
  // /posts/my-post → "my post"  (also strips ".uncommitted")
  const slug = url.split('/').filter(Boolean).pop() || url
  return slug
    .replace(/\.html$/, '')
    .replace(/\.uncommitted$/, '')
    .replace(/[-_]/g, ' ')
}
