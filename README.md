<h1 align="center" class="b">
  <br>
  JAAMD
</h1>
<p align="center" class="b">
  <b>Just Another Astro Markdown</b> - remark plugins, client-side enhancements and styles as a single Astro integration.
</p>
<br>
<br>

## Install

```bash
npm install jaamd
# or
npx astro add jaamd
```

## Setup

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import jaamd from "jaamd";

export default defineConfig({
  integrations: [jaamd()],
});
```

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

## Options

```ts
jaamd({
  selector: ".jaamd-content",   // must match the class on <MarkdownContent>
  plugins: {
    codeTabs:  true,            // :::code-tabs directive blocks
    alerts:    true,            // > [!NOTE] / [!WARNING] blockquote alerts
    directive: true,            // remark-directive (prerequisite for codeTabs)
  },
})
```

### Custom selector

```ts
jaamd({ selector: ".prose" })
```

```astro
<MarkdownContent class="prose"><slot /></MarkdownContent>
```

## Theming

All styles use CSS custom properties with neutral slate/gray fallbacks. Override on `:root` or `.jaamd-content`:

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

## Manual / advanced usage

Import plugins and styles directly, without the integration:

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
```