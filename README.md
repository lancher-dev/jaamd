<h1 align="center">JAAMD</h1>
<p align="center">
  <b>Just Another Astro Markdown</b> — remark plugins, client-side enhancements and styles as a single Astro integration.
</p>

---

## Table of Contents

- [Installation](#installation)
- [Requirements](#requirements)
- [Setup](#setup)
- [Integration Options](#integration-options)
- [Markdown Syntax](#markdown-syntax)
- [MarkdownContent Component](#markdowncontent-component)
- [Client-side Enhancements](#client-side-enhancements)
- [Theming](#theming)
  - [Customizing variables](#customizing-variables)
  - [Font sizes](#font-sizes)
  - [Dark mode](#dark-mode)
  - [Theme presets](#theme-presets)
  - [Dual-theme Shiki](#dual-theme-shiki)
- [Manual / Advanced Usage](#manual--advanced-usage)

---

## Installation

```bash
npm install @lancher-dev/jaamd
# or
npx astro add @lancher-dev/jaamd
```

## Requirements

| Requirement | Detail |
|---|---|
| Astro | `>=7.0.0 <8.0.0` |
| Toolchain | Must compile TypeScript and `.astro` sources |

JAAMD is published as source, with no compiled `dist/` and no emitted `.d.ts`.
It works out of the box in any Astro project, but is not consumable from plain
Node, a CommonJS build, or a TypeScript project using
`"moduleResolution": "node16"`.

## Setup

Add the integration to your Astro config:

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import jaamd from "@lancher-dev/jaamd";

export default defineConfig({
  integrations: [jaamd()],
});
```

Wrap your markdown content with the `MarkdownContent` component in your layout:

```astro
---
// src/layouts/BlogPost.astro
import MarkdownContent from "@lancher-dev/jaamd/components";
---
<MarkdownContent>
  <slot />
</MarkdownContent>
```

The integration registers all remark plugins and injects the stylesheet
automatically. No other configuration is required.

> [!IMPORTANT]
> `<MarkdownContent>` loads the stylesheets for you. If you render markdown
> **without** it, import them yourself in your layout frontmatter:
>
> ```astro
> ---
> import "@lancher-dev/jaamd/default.css";
> import "@lancher-dev/jaamd/styles.css";
> ---
> ```

## Integration Options

```ts
jaamd({
  selector:   ".jaamd-content", // CSS selector for the JS enhancements
  theme:      "github-light",   // Shiki theme name (or { light, dark })
  noDefault:  false,            // skip injecting @lancher-dev/jaamd/default variable fallbacks
  plugins: {
    codeTabs:  true,            // :::code-tabs directive blocks
    alerts:    true,            // > [!NOTE] / [!WARNING] blockquote alerts
    directive: true,            // remark-directive (prerequisite for codeTabs)
  },
})
```

### `selector`

Controls which element the **client-side JS enhancements** target at runtime.
It does not affect the CSS file, which always uses `.jaamd-content`.

- With `<MarkdownContent>`, leave it at the default.
- With a custom wrapper (e.g. `<div data-md>`), set `selector` to match it and
  provide your own CSS.

### `noDefault`

Set to `true` when you supply a complete `--jaamd-*` variable set of your own.
It has no effect on `<MarkdownContent>`, which imports the defaults directly;
with a custom wrapper, control them by importing `@lancher-dev/jaamd/default` or not.

## Markdown Syntax

### Alerts

GitHub-style blockquote alerts, in five variants:

```markdown
> [!NOTE]
> Useful information the reader should know.

> [!TIP]
> Helpful advice.

> [!IMPORTANT]
> Key information required to succeed.

> [!WARNING]
> Urgent information needing immediate attention.

> [!CAUTION]
> Advises about risks or negative outcomes.
```

### Code tabs

Group several code blocks into a tabbed panel. The text after the language is
used as the tab label; it falls back to the language, then to `Tab N`.

````markdown
:::code-tabs
```bash npm
npm install
```
```bash pnpm
pnpm install
```
:::
````

### Spoilers

Any element with the `spoiler` class is hidden until activated:

```html
<span class="spoiler">The butler did it.</span>
```

## MarkdownContent Component

`MarkdownContent` is a polymorphic component. It renders as `<div>` by default
and accepts any valid HTML tag via the `as` prop.

```ts
import MarkdownContent from "@lancher-dev/jaamd/components";
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `HTMLTag` | `"div"` | The HTML element to render as. |
| `class` | `string` | – | Extra CSS classes appended to the wrapper. |
| *...rest* | – | – | All standard HTML attributes for the chosen `as` element (e.g. `id`, `data-*`, `aria-*`). |

The `jaamd-content` class is always present on the wrapper element. It is the
selector used by the JS enhancements and must not be removed.

```astro
---
import MarkdownContent from "@lancher-dev/jaamd/components";
---

<!-- Default: renders as <div class="jaamd-content"> -->
<MarkdownContent>
  <slot />
</MarkdownContent>

<!-- Custom tag: renders as <article class="jaamd-content"> -->
<MarkdownContent as="article">
  <slot />
</MarkdownContent>

<!-- Extra classes: renders as <article class="jaamd-content prose mx-auto"> -->
<MarkdownContent as="article" class="prose mx-auto">
  <slot />
</MarkdownContent>
```

## Client-side Enhancements

A dependency-free ES module (~2 kB gzipped) enhances the rendered markdown. It
re-runs on every `astro:page-load`, so it keeps working across View Transitions.

| Enhancement | Behaviour |
|---|---|
| Heading links | Adds an anchor to `h1`–`h3`; clicking copies the section URL. Fills in a missing `id` with a Unicode-aware slug, de-duplicated across the page. |
| Copy buttons | Adds a copy button to every `pre`. |
| Image lightbox | Click an image to open it full-screen. Closes on backdrop click, the ✕ button or <kbd>Esc</kbd>. |
| Responsive tables | Wraps every `table` in a horizontally scrollable container. |
| Code tabs | Drives the `:::code-tabs` tablist. |
| Spoilers | Reveals `.spoiler` content on click or <kbd>Enter</kbd>/<kbd>Space</kbd>. |
| Details | Animates the height of `<details>` on open/close. |

### Keyboard

| Element | Keys |
|---|---|
| Code tabs | <kbd>←</kbd> <kbd>→</kbd> move between tabs, <kbd>Home</kbd> <kbd>End</kbd> jump to first/last. Panels are focusable so wide samples can be scrolled. |
| Spoilers | <kbd>Tab</kbd> to focus, <kbd>Enter</kbd> or <kbd>Space</kbd> to reveal. Hover does not reveal. |
| Lightbox | <kbd>Esc</kbd> to close. |

Under `prefers-reduced-motion: reduce` the `<details>` animation is skipped and
JAAMD's CSS transitions are disabled.

### Excluding images from the lightbox

Linked images are skipped automatically, so badges keep navigating:

```markdown
[![build](https://img.shields.io/badge/build-passing-green)](https://github.com/you/repo)
```

Opt a standalone image out with `data-no-lightbox`:

```html
<img src="/diagram.svg" alt="Architecture diagram" data-no-lightbox />
```

## Theming

All styles are driven by CSS custom properties prefixed with `--jaamd-*`. The
default set (`@lancher-dev/jaamd/default`) is injected automatically.

### Customizing variables

Override any variable on `:root` in your own stylesheet:

```css
:root {
  --jaamd-color-fg:            #334155;
  --jaamd-color-fg-bright:     #0f172a;
  --jaamd-color-primary:       #6366f1;
  --jaamd-color-primary-light: #818cf8;
  --jaamd-font-mono: ui-monospace, monospace;
  --jaamd-font-size: 1rem;
}
```

Defaults live in `@layer jaamd.defaults`, so an unlayered `:root` block always
wins regardless of import order.

See [`src/styles/variables.css`](src/styles/variables.css) for all 50 variables
and their default values.

### Font sizes

`--jaamd-font-size` is the one knob for the whole document. Every other size is
derived from it, so moving it moves the entire scale in proportion:

```css
:root {
  --jaamd-font-size: 1rem; /* headings, code, tables… all follow */
}
```

To break a single element out of that scale, set its own token. Each is read
with the derived value as its fallback, so **an unset token changes nothing** —
they are opt-in, one at a time:

```css
:root {
  --jaamd-font-size: 1rem; /* the baseline */
  --jaamd-font-size-h1: 2.5rem; /* but h1 is fixed, not proportional */
  --jaamd-font-size-code-block: 0.8rem; /* and code blocks are tighter */
}
```

| Token | Applies to | Default when unset |
|---|---|---|
| `--jaamd-font-size-h1` … `-h4` | `h1`–`h4` | `2.22` / `1.67` / `1.33` / `1.11` × base |
| `--jaamd-font-size-h5`, `-h6` | `h5`, `h6` | base |
| `--jaamd-font-size-p`, `-li` | paragraphs, list items | base |
| `--jaamd-font-size-blockquote` | `blockquote`, contents included | base |
| `--jaamd-font-size-code` | inline `` `code` `` | `0.78` × base |
| `--jaamd-font-size-code-block` | fenced code blocks | `0.85` × base |
| `--jaamd-font-size-table` | `th` and `td` together | `0.78` × base |
| `--jaamd-font-size-summary` | `<details>` summary | `0.89` × base |
| `--jaamd-font-size-alert-title` | alert titles | `0.83` × base |
| `--jaamd-font-size-footnotes` | footnotes block, contents included | `0.85` × base |

A block that owns a token governs what is inside it: paragraphs in a blockquote
follow `-blockquote`, not `-p`. Alert bodies have no token of their own and
follow `-p`; only their title is separate. The copy button, code-tab labels and
heading-link icons stay tied to `--jaamd-font-size`, they are JAAMD's own
chrome, not your document's typography.

### Dark mode

The default set includes dark-mode overrides activated by the `dark` class on
`<html>`. Toggle the class and all JAAMD elements adapt.

### Theme presets

Three presets restyle all `--jaamd-*` variables to match popular editor colour
schemes:

| Preset | Import | Recommended Shiki theme |
|--------|--------|------------------------|
| Dracula | `@lancher-dev/jaamd/themes/dracula` | `dracula` |
| Nord | `@lancher-dev/jaamd/themes/nord` | `nord` |
| One Dark | `@lancher-dev/jaamd/themes/one-dark` | `one-dark-pro` |

As a standalone theme, replacing the default light theme:

```ts
jaamd({ theme: "dracula", noDefault: true })
```

```css
@import "@lancher-dev/jaamd/themes/dracula.css";
@import "@lancher-dev/jaamd/styles.css";
```

Scoped to `html.dark` via the `/dark` variant:

```css
@import "@lancher-dev/jaamd/themes/dracula/dark.css";
```

```ts
import "@lancher-dev/jaamd/themes/dracula/dark";
```

Copy any preset from `src/themes/` to customise it.

### Dual-theme Shiki

Pass an object to `theme` to highlight code with two colour schemes, switched by
the `dark` class:

```ts
jaamd({
  theme: { light: "github-light", dark: "github-dark" },
})
```

Add an inline script in `<head>` to prevent a flash of the wrong theme:

```html
<script is:inline>
  (function () {
    var t = localStorage.getItem("theme");
    if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches))
      document.documentElement.classList.add("dark");
  })();
</script>
```

## Manual / Advanced Usage

To bypass the integration, register the plugins yourself. Astro's default
markdown processor does not run `markdown.remarkPlugins`, so pass the `unified`
processor from `@astrojs/markdown-remark` explicitly:

```ts
// astro.config.mjs
import { unified } from "@astrojs/markdown-remark";
import { remarkCodeTabs, remarkAlert, remarkDirective } from "@lancher-dev/jaamd";

export default defineConfig({
  markdown: {
    processor: unified({
      remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],
    }),
  },
});
```

```astro
---
import "@lancher-dev/jaamd/default";  // variable fallbacks; omit if you provide your own
import "@lancher-dev/jaamd/styles";
---
<div class="jaamd-content">
  <slot />
</div>
<script>
  import { initMarkdownEnhancements } from "@lancher-dev/jaamd/client";
  function run() { initMarkdownEnhancements(".jaamd-content"); }
  run();
  document.addEventListener("astro:page-load", run);
</script>
```

The CSS files can also be imported from plain `.css`:

```css
@import "@lancher-dev/jaamd/default.css";
@import "@lancher-dev/jaamd/styles.css";
```
