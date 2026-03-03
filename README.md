<h1 align="center">JAAMD</h1>
<p align="center">
  <b>Just Another Astro Markdown</b> — remark plugins, client-side enhancements and styles as a single Astro integration.
</p>

---

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [View Transitions (FOUC fix)](#view-transitions-fouc-fix)
- [Integration Options](#integration-options)
- [MarkdownContent Component](#markdowncontent-component)
- [Theming](#theming)
- [Manual / Advanced Usage](#manual--advanced-usage)

---

## Installation

```bash
npm install jaamd
# or
npx astro add jaamd
```

---

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
import { MarkdownContent } from "jaamd/components";
---
<MarkdownContent>
  <slot />
</MarkdownContent>
```

The integration registers all remark plugins and injects the stylesheet automatically. No other configuration is required.

---

## View Transitions (FOUC fix)

If you are using Astro's `ClientRouter` (View Transitions), you may notice a **flash of unstyled content** when navigating between pages. This happens because the integration injects the stylesheet via `injectScript("page", ...)` — a JS module that runs *after* the new page content has already been swapped into the DOM.

To fix it, import the stylesheet **statically** in your layout's frontmatter alongside your other CSS. Astro will bundle it as a `<link>` in `<head>`, which persists across navigations and is applied before any render:

```astro
---
//  In any layout that uses MarkdownContent
import "jaamd/styles.css";
---
```

The duplicate import from `injectScript` is automatically deduplicated by the browser — no extra weight, no side effects.

---

## Integration Options

```ts
jaamd({
  selector: ".jaamd-content",   // CSS selector for the JS enhancements (see below)
  plugins: {
    codeTabs:  true,            // :::code-tabs directive blocks
    alerts:    true,            // > [!NOTE] / [!WARNING] blockquote alerts
    directive: true,            // remark-directive (prerequisite for codeTabs)
  },
})
```

### About `selector`

`selector` only controls which element the **client-side JS enhancements** target at runtime. It does **not** affect the CSS file, which always uses `.jaamd-content`.

- **When using `<MarkdownContent>`** — leave `selector` at its default. The component always adds `jaamd-content` to the wrapper, the CSS targets it, and so does the JS.
- **When doing [manual usage](#manual--advanced-usage)** — if you write a completely custom wrapper (e.g. `<div data-md>`), set `selector` to match it. You will also need to provide your own CSS, since the bundled stylesheet is hardcoded to `.jaamd-content`.

---

## MarkdownContent Component

`MarkdownContent` is a polymorphic component. It renders as `<div>` by default and accepts any valid HTML tag via the `as` prop.

> ```ts
> import { MarkdownContent } from "jaamd/components";
> ```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `HTMLTag` | `"div"` | The HTML element to render as. |
| `class` | `string` | — | Extra CSS classes appended to the wrapper. |
| *...rest* | — | — | All standard HTML attributes for the chosen `as` element (e.g. `id`, `data-*`, `aria-*`). |

The `jaamd-content` class is always present on the wrapper element — it is the selector used by the JS enhancements and must not be removed.

### Examples

```astro
---
import { MarkdownContent } from "jaamd/components";
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

---

## Theming

All styles use CSS custom properties with neutral slate/gray fallbacks. Override them on `:root` or `.jaamd-content`:

```css
:root {
  /* foreground */
  --jaamd-color-fg:            #334155;
  --jaamd-color-fg-bright:     #0f172a;
  --jaamd-color-primary:       #6366f1;
  --jaamd-color-primary-light: #818cf8;

  /* background / border */
  --jaamd-color-bg-secondary:  #f8fafc;
  --jaamd-color-border:        #e2e8f0;

  /* code blocks */
  --jaamd-pre-bg:              #0f172a;
  --jaamd-pre-fg:              #e2e8f0;
  --jaamd-code-bg:             #f1f5f9;
  --jaamd-code-fg:             #0f172a;

  /* typography */
  --jaamd-font-sans:  ui-sans-serif, system-ui, sans-serif;
  --jaamd-font-mono:  ui-monospace, monospace;
  --jaamd-font-size:  1rem;
}
```

Full variable reference is in `src/styles/markdown.css`.

---

## Manual / Advanced Usage

Import plugins and styles directly, bypassing the integration:

```ts
// astro.config.mjs
import { remarkCodeTabs, remarkAlert, remarkDirective } from "jaamd";

export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAlert, remarkDirective, remarkCodeTabs],
  },
});
```

```astro
---
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

You can also import the CSS file directly from `.css` files or frameworks that prefer bare CSS imports:

```css
@import "jaamd/styles.css";
```
