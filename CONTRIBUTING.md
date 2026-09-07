# Contributing

```bash
pnpm install
pnpm dev                    # the showcase, on localhost:4321
pnpm typecheck && pnpm lint
pnpm test:slug && pnpm test:themes
pnpm build && pnpm smoke
```

## Themes

A theme is a directory under `packages/jaamd/src/themes/<slug>/` plus one entry in
`packages/jaamd/src/themes/index.js`. Themes are welcome as pull requests.

The CSS is generated. You write a palette; `pnpm build:themes` writes `index.css`
and, for a single-palette theme, `dark.css`. Never edit those by hand.

### 1. Write `palette.js`

Fourteen colours per palette. A `dual` theme fills both `light` and `dark`, the
others leave one `null`.

```js
export default {
  light: null,
  dark: {
    recessed: "#21222c",   // below the background: code-tab header
    base:     "#282a36",   // the background itself
    surface:  "#44475a",   // raised: inline code, table rows, spoilers
    overlay:  "#6272a4",   // borders and rules
    text:     "#f8f8f2",
    bright:   "#ffffff",   // headings, strong

    primary:      "#bd93f9",
    primaryLight: "#ff79c6",
    accent:       "#8be9fd",   // emphasis

    alert: { note: "#8be9fd", tip: "#50fa7b", important: "#bd93f9",
             warning: "#f1fa8c", caution: "#ff5555" },
  },
};
```

Most palettes document these levels already: Catppuccin has `mantle/base/surface0/
overlay0/text`, Gruvbox the `bg0_h/bg0/bg1/bg2`, Rosé Pine `base/surface/muted`,
Tokyo Night `bg_dark/bg/bg_highlight/comment`.

Where a palette wants a token off the recipe, add it under `overrides`:

```js
    overrides: { "blockquote-fg": "#6272a4" },
```

### 2. Declare it

Add an entry to `src/themes/index.js` with the directory name as `slug` and a
readable `name`, plus:

| `mode` | The palette is | `shiki` |
|---|---|---|
| `"light"` / `"dark"` | one palette, applying in both modes | one theme name |
| `"dual"` | two palettes, `:root` and `html.dark` | `{ light, dark }` |

### 3. Generate and check

```bash
pnpm build:themes
pnpm test:themes
```

The test names the missing level, an unknown Shiki theme, a token no other theme
lacks, or CSS that no longer matches its palette.
