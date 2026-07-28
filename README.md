<h1 align="center">JAAMD</h1>
<p align="center">
  <b>Just Another Astro Markdown</b> — remark plugins, client-side enhancements and styles as a single Astro integration.
</p>

---

## Table of Contents

- [Installation](#installation)
- [Compatibility](#compatibility)
- [Setup](#setup)
- [Styles and View Transitions](#styles-and-view-transitions)
- [Integration Options](#integration-options)
- [MarkdownContent Component](#markdowncontent-component)
- [Client-side Enhancements](#client-side-enhancements)
- [Theming](#theming)
  - [Customizing variables](#customizing-variables)
  - [Dark mode](#dark-mode)
  - [Theme presets](#theme-presets)
  - [Dual-theme Shiki](#dual-theme-shiki-optional)
- [Manual / Advanced Usage](#manual--advanced-usage)

---

## Installation

```bash
npm install jaamd
# or
npx astro add jaamd
```

## Compatibility

| Requirement | Detail |
|---|---|
| Astro | `>=7.0.0 <8.0.0` |
| Consumer toolchain | Must compile TypeScript and `.astro` sources |

JAAMD is **distributed as source**: the published package contains `index.ts`
and the `.astro`/`.ts`/`.css` files themselves, with no compiled `dist/` and no
emitted `.d.ts`. This keeps the package dependency-free and lets your own
bundler tree-shake it, and it works out of the box in any Astro project: the
integration adds itself to `vite.ssr.noExternal` so Vite transforms it like
first-party code.

The trade-off is that JAAMD is **not** consumable outside an Astro/Vite
pipeline: importing it from plain Node, from a CommonJS build, or from a
TypeScript project using `"moduleResolution": "node16"` will not work.

> [!NOTE]
> The Astro peer range is deliberately capped below the next major. JAAMD has to
> recognise Astro's *default* markdown processor in order to attach its remark
> plugins to it, and that processor's identity is an implementation detail
> rather than a public API. The range is widened again only after each new Astro
> major has been verified. The CI smoke test asserts on the rendered HTML
> precisely because this failure mode would otherwise be silent.

## Setup

Add the integration to your Astro config:

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import jaamd from "jaamd";

export default defineConfig({
  integrations: [jaamd()],
});
```

Wrap your markdown content with the `MarkdownContent` component in your layout:

```astro
---
// src/layouts/BlogPost.astro
import MarkdownContent from "jaamd/components";
---
<MarkdownContent>
  <slot />
</MarkdownContent>
```

The integration registers all remark plugins and injects the stylesheet automatically. No other configuration is required.

## Styles and View Transitions

`<MarkdownContent>` imports `jaamd/default` and `jaamd/styles` **statically in its own frontmatter**. Astro's CSS pipeline extracts them into a real `<link>` in `<head>`, so they are applied before first paint and persist across `ClientRouter` (View Transitions) navigations. If you use the component, there is nothing to configure — no flash of unstyled content.

The integration *also* imports the same two stylesheets from its injected page script. That copy is a fallback for custom wrappers (see [Manual / Advanced Usage](#manual--advanced-usage)); the duplicate is deduplicated by the bundler and the browser.

> [!IMPORTANT]
> If you render markdown **without** `<MarkdownContent>`, do not rely on the injected script to deliver the CSS — side-effect CSS imports inside `injectScript()` are not reliably retained by Rollup in a static build. Import the stylesheets yourself in your layout frontmatter:
>
> ```astro
> ---
> import "jaamd/default.css";
> import "jaamd/styles.css";
> ---
> ```

## Integration Options

```ts
jaamd({
  selector:   ".jaamd-content", // CSS selector for the JS enhancements
  theme:      "github-light",   // Shiki theme name (or { light, dark } — see below)
  noDefault:  false,            // skip injecting jaamd/default variable fallbacks
  plugins: {
    codeTabs:  true,            // :::code-tabs directive blocks
    alerts:    true,            // > [!NOTE] / [!WARNING] blockquote alerts
    directive: true,            // remark-directive (prerequisite for codeTabs)
  },
})
```

### About `selector`

`selector` only controls which element the **client-side JS enhancements** target at runtime. It does **not** affect the CSS file, which always uses `.jaamd-content`.

- **When using `<MarkdownContent>`** leave `selector` at its default. The component always adds `jaamd-content` to the wrapper, the CSS targets it, and so does the JS.
- **When doing [manual usage](#manual--advanced-usage)**, if you write a completely custom wrapper (e.g. `<div data-md>`), set `selector` to match it. You will also need to provide your own CSS, since the bundled stylesheet is hardcoded to `.jaamd-content`.

## MarkdownContent Component

`MarkdownContent` is a polymorphic component. It renders as `<div>` by default and accepts any valid HTML tag via the `as` prop.

```ts
import MarkdownContent from "jaamd/components";
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `HTMLTag` | `"div"` | The HTML element to render as. |
| `class` | `string` | — | Extra CSS classes appended to the wrapper. |
| *...rest* | — | — | All standard HTML attributes for the chosen `as` element (e.g. `id`, `data-*`, `aria-*`). |

The `jaamd-content` class is always present on the wrapper element. It is the selector used by the JS enhancements and must not be removed.

### Examples

```astro
---
import MarkdownContent from "jaamd/components";
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

The integration ships a small dependency-free ES module (~2 kB gzipped) that
progressively enhances the rendered markdown. It re-runs automatically on every
`astro:page-load`, so everything keeps working across View Transitions.

| Enhancement | Behaviour |
|---|---|
| Heading links | Adds an anchor to `h1`–`h3`; clicking copies the section URL. Fills in a missing `id` using a Unicode-aware slug, de-duplicated against the rest of the page. |
| Copy buttons | Adds a copy button to every `pre`, with its accessible name updated on success. |
| Image lightbox | Click an image to open it full-screen. Closes on backdrop click, the ✕ button or <kbd>Esc</kbd>. |
| Responsive tables | Wraps every `table` in a horizontally scrollable container. |
| Code tabs | Drives the `:::code-tabs` tablist (see below). |
| Spoilers | Reveals `.spoiler` content on click or <kbd>Enter</kbd>/<kbd>Space</kbd>. |
| Details | Animates the height of `<details>` on open/close. |

### Accessibility and motion

- **Code tabs** follow the WAI-ARIA tabs pattern: <kbd>←</kbd>/<kbd>→</kbd> move
  between tabs, <kbd>Home</kbd>/<kbd>End</kbd> jump to the first/last, and
  `aria-selected` plus the roving `tabindex` are kept in sync with the visual
  state. Panels are focusable so wide samples can be scrolled by keyboard.
- **Spoilers** are exposed as `role="button"`, are reachable with <kbd>Tab</kbd>
  and report `aria-expanded`. They deliberately do **not** reveal on hover: that
  would spoil the content by merely moving the pointer, and the hover state
  sticks after a tap on touch devices.
- **Reduced motion** is respected throughout: with
  `prefers-reduced-motion: reduce`, the `<details>` height animation is skipped
  and JAAMD's CSS transitions are reduced to nothing.

### Images that should not open a lightbox

Images that are themselves a link are skipped automatically, so the common
badge pattern keeps navigating instead of opening an overlay:

```markdown
[![build](https://img.shields.io/badge/build-passing-green)](https://github.com/you/repo)
```

To opt a standalone image out, add `data-no-lightbox`:

```html
<img src="/diagram.svg" alt="Architecture diagram" data-no-lightbox />
```

## Theming

All styles are driven by CSS custom properties prefixed with `--jaamd-*`. The default variable set (`jaamd/default`) is injected automatically so everything works out of the box.

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

See [`src/styles/variables.css`](src/styles/variables.css) for every available variable and its default value.

### Dark mode

The default variable set includes dark-mode overrides activated by the `dark` class on `<html>`. Toggle the class and all JAAMD elements adapt.

### Theme presets

Three additional presets restyle all `--jaamd-*` variables to match popular editor colour schemes:

| Preset | Import | Recommended Shiki theme |
|--------|--------|------------------------|
| Dracula | `jaamd/themes/dracula` | `dracula` |
| Nord | `jaamd/themes/nord` | `nord` |
| One Dark | `jaamd/themes/one-dark` | `one-dark-pro` |

**Standalone preset** — replaces the default light theme entirely:

```ts
jaamd({ theme: "dracula", noDefault: true })
```

```css
@import "jaamd/themes/dracula.css";
@import "jaamd/styles.css";
```

**Dark-mode toggle** — each preset ships a `/dark` variant scoped to `html.dark`:

```css
@import "jaamd/themes/dracula/dark.css";
```

```ts
import "jaamd/themes/dracula/dark";
```

You can also copy any preset from `src/themes/` and customise the values.

### Dual-theme Shiki (optional)

Pass an object to `theme` to configure Shiki with two colour schemes and CSS-variable–based switching:

```ts
jaamd({
  theme: { light: "github-light", dark: "github-dark" },
})
```

JAAMD sets `defaultColor: false` on Shiki and injects a stylesheet that swaps token colours when `html.dark` is present. Add an inline script in `<head>` to prevent a flash of wrong theme:

```html
<script is:inline>
  (function () {
    var t = localStorage.getItem("theme");
    if (t === "dark" || (!t && matchMedia("(prefers-color-scheme: dark)").matches))
      document.documentElement.classList.add("dark");
  })();
</script>
```

### Skipping the defaults

If you supply your own full variable set, set `noDefault: true`:

```ts
jaamd({ noDefault: true })
```

## Manual / Advanced Usage

Import plugins and styles directly, bypassing the integration:

Astro 7's default Markdown processor (Sätteri) doesn't run `markdown.remarkPlugins`. You need the `unified` processor from `@astrojs/markdown-remark` explicitly:

```ts
// astro.config.mjs
import { unified } from "@astrojs/markdown-remark";
import { remarkCodeTabs, remarkAlert, remarkDirective } from "jaamd";

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
import "jaamd/default";  // variable fallbacks — omit if you provide your own
import "jaamd/styles";
---
<div class="jaamd-content">
  <slot />
</div>
<script>
  import { initMarkdownEnhancements } from "jaamd/client";
  function run() { initMarkdownEnhancements(".jaamd-content"); }
  run();
  document.addEventListener("astro:page-load", run);
</script>
```

You can also import the CSS files directly from `.css` files or frameworks that prefer bare CSS imports:

```css
@import "jaamd/default.css";
@import "jaamd/styles.css";
```
