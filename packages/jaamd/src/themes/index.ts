/**
 * What every theme declares about itself. Consumers build theme pickers from
 * this instead of hardcoding a list, and `tests/unit/themes.mjs` checks that
 * each entry matches a directory that honours the token contract.
 */
export interface JaamdTheme {
  /** Directory name, and the value a `data-jaamd-theme` attribute would carry. */
  slug: string;
  /** Human-readable name, for pickers. */
  name: string;
  /** Whether the palette expects `html.dark`. Not every theme is dark. */
  mode: "light" | "dark";
  /** Shiki theme that pairs with this palette. */
  shiki: string;
}

export const themes: JaamdTheme[] = [
  { slug: "dracula", name: "Dracula", mode: "dark", shiki: "dracula" },
  { slug: "nord", name: "Nord", mode: "dark", shiki: "nord" },
  { slug: "one-dark", name: "One Dark", mode: "dark", shiki: "one-dark-pro" },
];

/** Seeds a theme must declare; everything else derives from them in variables.css. */
export const REQUIRED_TOKENS = [
  "--jaamd-bg",
  "--jaamd-color-fg",
  "--jaamd-color-fg-bright",
  "--jaamd-color-primary",
  "--jaamd-alert-note-color",
  "--jaamd-alert-tip-color",
  "--jaamd-alert-important-color",
  "--jaamd-alert-warning-color",
  "--jaamd-alert-caution-color",
] as const;
