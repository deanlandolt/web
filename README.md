# deanlandolt.com

Dean Landolt's personal site, built with [VitePress](https://vitepress.dev).

The hero is a draggable ASCII-art flourish (pure trigonometry, no three.js) with a rotating set of verified quotes underneath.

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

## Build & preview

```sh
pnpm build      # outputs to site/.vitepress/dist
pnpm preview    # serve the build locally
```

## Deploy

Deploys automatically on push to `main` via `.github/workflows/deploy.yml`
(pnpm, frozen lockfile, VitePress build → GitHub Pages).

## Layout

```
site/
  .vitepress/
    config.ts            # site config, nav, theme
    theme/               # style.css, notes.css, posts.css, index.ts
    components/          # AsciiArt, RotatingQuote, NotesIndex, PostsIndex, QuotesIndex, QuoteRef
    data/                # notes.data.ts, posts.data.ts, quotes.generated.json
  quotes/
    quotes.yaml          # the quote collection (single source of truth)
    quotes-db.mjs        # shared slug/YAML logic
    [slug].md            # dynamic-route template for quote pages
    [slug].paths.js      # dynamic-route loader (reads quotes.yaml)
  index.md               # home
  notes/                 # evergreen notes (no dates, tag-filterable)
  posts/                 # dated posts (chronological)
```

Authoring guide and frontmatter reference: [`site/README.md`](site/README.md).

Planning / working docs live in `.scratch/` (gitignored, outside the content root).

## License

Site content is © Dean Landolt. Source code is MIT — see LICENSE if/when added.