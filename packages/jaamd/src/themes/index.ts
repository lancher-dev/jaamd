/*
 * Theme manifest. Consumers build pickers from this instead of hardcoding a
 * list; `tests/unit/themes.mjs` checks each entry against a directory that
 * honours the token contract.
 */

/**
 * `light` and `dark` are single palettes applying in both modes. `dual` carries
 * both a `:root` block and an `html.dark` one, and follows the mode; it has no
 * `/dark` variant.
 */
export type JaamdThemeMode = "light" | "dark" | "dual";

export interface JaamdTheme {
  /** Directory name, and the value a `data-jaamd-theme` attribute would carry. */
  slug: string;
  /** Human-readable name, for pickers. */
  name: string;
  mode: JaamdThemeMode;
  /** Shiki theme that pairs with this palette, or a pair for a `dual` one. */
  shiki: string | { light: string; dark: string };
}

export const themes: JaamdTheme[] = [
  {
    slug: "catppuccin",
    name: "Catppuccin",
    mode: "dual",
    shiki: { light: "catppuccin-latte", dark: "catppuccin-mocha" },
  },
  { slug: "dracula", name: "Dracula", mode: "dark", shiki: "dracula" },
  {
    slug: "gruvbox",
    name: "Gruvbox",
    mode: "dual",
    shiki: { light: "gruvbox-light-medium", dark: "gruvbox-dark-medium" },
  },
  { slug: "nord", name: "Nord", mode: "dark", shiki: "nord" },
  { slug: "one-dark", name: "One Dark", mode: "dark", shiki: "one-dark-pro" },
  {
    slug: "rose-pine",
    name: "Rosé Pine",
    mode: "dual",
    shiki: { light: "rose-pine-dawn", dark: "rose-pine" },
  },
  {
    slug: "rose-pine-moon",
    name: "Rosé Pine Moon",
    mode: "dual",
    shiki: { light: "rose-pine-dawn", dark: "rose-pine-moon" },
  },
  { slug: "tokyo-night", name: "Tokyo Night", mode: "dark", shiki: "tokyo-night" },
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
