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
`packages/jaamd/src/themes/index.ts`. Themes are welcome as pull requests.

### 1. Write `index.css`

A `:root` block of `--jaamd-*` declarations. A theme that has both a light and a
dark palette adds a second block on `html.dark`, and must repeat the seeds there —
otherwise one mode borrows the other's background. These **seeds are required**:

| Token | What it is |
|---|---|
| `--jaamd-bg` | Page background the palette assumes |
| `--jaamd-color-fg` | Body text |
| `--jaamd-color-fg-bright` | Headings, strong, table headers |
| `--jaamd-color-primary` | Links and accents |
| `--jaamd-alert-*-color` | The five alert hues: note, tip, important, warning, caution |

Everything else — surfaces, borders, the table-of-contents card, alert backgrounds —
is derived from those by `src/styles/variables.css`, so a nine-colour theme is already
complete. Omitting `--jaamd-bg` is the one mistake that looks like it works: the
derived tokens silently mix against the *default* background instead of yours.

Beyond the seeds you may override any concrete token an editor scheme defines by
hand rather than by formula — `--jaamd-code-bg`, `--jaamd-pre-bg` and friends. See
an existing theme for the full list.

Do not restate the font tokens: they are the defaults already.

### 2. Declare it

Add an entry to `src/themes/index.ts` with the directory name as `slug` and a
readable `name`, plus:

| `mode` | The palette is | `shiki` |
|---|---|---|
| `"light"` / `"dark"` | one palette, applying in both modes | one theme name |
| `"dual"` | two palettes, `:root` and `html.dark` | `{ light, dark }` |

### 3. Generate the dark variant

```bash
pnpm build:themes
```

`dark.css` is `index.css` under `html.dark` — the variant for using a single-palette
theme only in dark mode. It is generated and committed; never edit it by hand. A
`dual` theme covers dark mode itself and gets no `dark.css`.

### 4. Check it

```bash
pnpm test:themes
```

This is what makes a theme reviewable: it names the missing seed, an unknown Shiki
theme, or a stale `dark.css`, instead of leaving the defect to show up on screen
later.
