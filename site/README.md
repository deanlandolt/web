# site — content & authoring guide

This directory holds the site content for `deanlandolt.com`. The build config,
theme, and components live under `.vitepress/`; everything else is pages
written in Markdown.

For repo-level setup (install, build, deploy), see the
[root README](../README.md).

---

## Pages

Every Markdown file becomes a page at the matching path:

| File               | URL              |
| ------------------ | ---------------- |
| `index.md`         | `/`              |
| `about.md`         | `/about`         |
| `notes.md`         | `/notes`         |
| `notes/my-note.md` | `/notes/my-note` |
| `posts.md`         | `/posts`         |
| `posts/my-post.md` | `/posts/my-post` |

## Notes

Drop a Markdown file into `notes/` and it appears on `/notes` automatically — a
flat, tag-filterable list. No dates, no chronology — just files.

Frontmatter (all optional):

```yaml
---
title: My note # falls back to the filename
tags: [software, unix] # shown as chips on the index
draft: true # hides the note from the index (still builds)
---
```

Wired by `.vitepress/data/notes.data.ts` (a VitePress `createContentLoader`),
rendered by `.vitepress/components/NotesIndex.vue`, styled in
`.vitepress/theme/notes.css`.

## Posts

Same idea, but dated. A `date:` frontmatter field drives sort order (newest
first). Frontmatter (all optional):

```yaml
---
title: My post # falls back to the filename
date: 2025-08-13 # sort key (newest first)
tags: [meta]
---
```

Wired by `.vitepress/data/posts.data.ts`, rendered by
`.vitepress/components/PostsIndex.vue`, styled in `.vitepress/theme/posts.css`.

## Quotes

Quotes live in `quotes/quotes.yaml` — a single hand-maintained source of truth.
VitePress dynamic routes (`[slug].md` + `[slug].paths.js`) generate one page per
quote at build time (no markdown files written to disk). A build script
(`scripts/gen-quotes.mjs`) writes `quotes.generated.json` for the client-side
index, inline `QuoteRef` references in notes, and the home page rotating quote.
Each quote has a `text`, `author`, and a `source` URL (a discreet `†` link that
verifies the attribution). Keep them verified.

## The ASCII art hero

The home-page hero is `.vitepress/components/AsciiArt.vue` — a rotating
ASCII-art shape rendered with pure trigonometry (no three.js, no WebGL). It's
draggable and idles with a slow auto-spin (disabled under
`prefers-reduced-motion`). You generally won't need to touch it.

## Theme

Palette and retro-minimalist tweaks live in `.vitepress/theme/style.css` (plus
`notes.css` and `posts.css` for the indexes). The accent color is a
phosphor-ish green defined as `--dl-accent`; headings use a monospace stack.
