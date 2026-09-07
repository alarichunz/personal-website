# The Workshop

A personal site styled as a *Renaissance workshop* — a lifelong notebook,
laboratory, and library rolled into one. Built with [Hugo](https://gohugo.io/)
(Extended). 

This repository contains the source, layouts, styling, and content for the site.

## Requirements

Hugo **Extended** and **Dart Sass** — the SCSS uses `@use` modules, which need
the Dart Sass transpiler (Hugo's bundled libsass won't compile them).

```sh
brew install hugo dart-sass        # macOS
```

## Develop

```sh
make run     # hugo server -D --noHTTPCache --disableFastRender → http://localhost:1313
make build   # production build into ./public
```

## Structure

```
hugo.toml              site config, menu, params, markup
content/
  _index.md            home lead paragraph
  notebook/            essays & engineering notes   (section)
  laboratory/          shaders, sims, sketches      (section)
  library/             annotated references         (section)
  about.md             about page
layouts/
  _default/baseof.html shell + inline theme bootstrap
  index.html           home: lead + the four rooms + recent
  _default/list.html   section index (year-gutter list)
  _default/single.html post: masthead, hero, content + sticky TOC
  library/list.html    Library bookshelf: cover grid grouped by theme
  partials/            head, top-nav, footer, hero, entry-list, icon
  _markup/             render hooks (heading anchors)
data/
  library.json         the bookshelf: theme groups + per-book cover/Goodreads
assets/
  scss/                design tokens + styles (entry: main.scss)
  js/theme-toggle.js   light/dark switch
static/
  favicon.png          site icon (Leonardo church study) + favicon-32, apple-touch
  fonts/               vendored Libre Caslon .woff2 files
  sketches/            ES-module canvas/WebGL sketches for Laboratory heroes
  images/
archetypes/            `hugo new` templates per section
.github/workflows/     GitHub Pages deploy
```

## Writing

```sh
make new-notebook name=on-compilers     # → content/notebook/on-compilers.md
make new-lab      name=reaction-diffusion
make new-library  name=godel-escher-bach
```

New pages start as `draft = true`; `make run` shows drafts, `make build` hides
them.

### Frontmatter

```toml
title       = 'Title'
date        = 2026-06-16
description  = 'One-line subtitle, shown under the title and in indexes.'
tags        = ['graphics']
toc         = true            # sticky table of contents (notebook default)
hero        = '/sketches/x.js'  # optional; see below
```

### Heroes (Laboratory)

A post can mount a visual above its title via `hero`, routed by extension:

| `hero` value            | Renders                                      |
| ----------------------- | -------------------------------------------- |
| `/sketches/foo.js`      | `<canvas>` + your ES-module (WebGL / shader) |
| `/images/foo.png\|gif…` | `<img>`                                      |
| `/videos/foo.mp4\|webm` | autoplaying, looping, muted `<video>`        |

A sketch module grabs `document.querySelector('[data-hero-canvas]')` and draws
into it.

## Theming

Colors and type live as CSS custom properties in
[`assets/scss/_tokens.scss`](assets/scss/_tokens.scss). Light mode is parchment /
graphite / muted bronze; dark mode is true black with the same bronze accent.
The toggle sits in the top nav; the default theme is set by `params.defaultTheme`
in `hugo.toml` (`light` | `dark` | `auto`).

Body and titles are set in **Libre Caslon** (a free revival of the Caslon used
by 18th-century presses) — Text cut for body, Display cut for the large titles.
The `.woff2` files are **vendored** in `static/fonts/`, with `@font-face` rules
in [`assets/scss/_fonts.scss`](assets/scss/_fonts.scss) (no external request).
That file is generated from the Google Fonts CSS; to refresh or add weights,
re-run the download and regenerate it.

The favicon is an `AH` monogram set in Libre Caslon Display — charcoal on a
parchment field with a bronze hairline frame, matching the light theme. The
PNGs (`favicon.png`, `favicon-32.png`, `apple-touch-icon.png`) live in `static/`,
with a 512px master at `static/images/favicon-monogram.png`. It was rendered
from the vendored font; to regenerate, re-run the render script (Pillow + the
woff2 converted to TTF via fontTools).

### Social icons

The top-nav icon links come from `params.social` in `hugo.toml` (`name`, `icon`,
`url`). Inline SVGs live in [`partials/icon.html`](layouts/partials/icon.html)
(currently `github` + `linkedin`) — fill in your own URLs there. Add another by
giving it an `icon` key and a matching `<svg>` branch in the partial.

## Optional next steps

- **KaTeX**: math passthrough is configured in `hugo.toml`; add the KaTeX
  CSS/JS (drop into `static/katex/` and load in `partials/head.html`) to render.
- **Search**: a home/section search can be added later (nathan.rs builds a JSON
  index).

## Library bookshelf

The Library section is a grid of books grouped by theme (à la
jordanbpeterson.com/books). It is data-driven.

## Deploy

`.github/workflows/deploy.yml` builds with Hugo Extended and publishes `./public`
to GitHub Pages. In the repo settings set **Pages → Source → GitHub Actions**.
For a custom domain, add `static/CNAME` containing the domain.
