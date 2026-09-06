/**
 * `light` and `dark` are single palettes that apply in both modes; `dual` carries
 * both, a `:root` block and an `html.dark` one, and follows whatever decides the
 * mode. A `dual` theme has no `/dark` variant — its own file already does that.
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

export declare const themes: JaamdTheme[];

export declare const REQUIRED_TOKENS: string[];
