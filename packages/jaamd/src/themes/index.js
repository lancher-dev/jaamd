/**
 * What every theme declares about itself. Consumers build theme pickers from
 * this instead of hardcoding a list, and `tests/unit/themes.mjs` checks that
 * each entry matches a directory that honours the token contract.
 *
 * Plain JavaScript on purpose: Node refuses to strip types from files under
 * node_modules, so a TypeScript manifest would be readable by bundlers and by
 * nothing else — tooling and test runners included. Types live in index.d.ts.
 */

/** @type {import("./index.d.ts").JaamdTheme[]} */
export const themes = [
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
];
