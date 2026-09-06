import { themes as packageThemes } from "@lancher-dev/jaamd/themes";
import type { JaamdTheme, JaamdThemeMode } from "@lancher-dev/jaamd/themes";

/**
 * The site's own palette. `dual` like any theme that carries both a light and a
 * dark block: with one picker and no separate toggle, those follow the system.
 */
export const SITE_THEME: JaamdTheme = {
  slug: "default",
  name: "Default",
  mode: "dual",
  shiki: { light: "github-light", dark: "one-dark-pro" },
};

export const siteThemes: JaamdTheme[] = [SITE_THEME, ...packageThemes];

export const THEME_STORAGE_KEY = "jaamd-theme";

/** slug → mode, the only thing the picker and the boot script need to agree on. */
export const themeModes: Record<string, JaamdThemeMode> = Object.fromEntries(
  siteThemes.map((t) => [t.slug, t.mode]),
);

/**
 * Shiki bakes one set of variables per key. A dual theme needs two, so its dark
 * palette gets `<slug>-dark`.
 */
export function shikiKeys(theme: JaamdTheme): { light?: string; dark?: string } {
  if (typeof theme.shiki === "string") {
    return theme.mode === "light" ? { light: theme.slug } : { dark: theme.slug };
  }
  return { light: theme.slug, dark: `${theme.slug}-dark` };
}

export const shikiThemes: Record<string, string> = Object.fromEntries(
  siteThemes.flatMap((theme) => {
    const keys = shikiKeys(theme);
    const shiki = theme.shiki;
    return typeof shiki === "string"
      ? [[keys.light ?? keys.dark!, shiki]]
      : [
          [keys.light!, shiki.light],
          [keys.dark!, shiki.dark],
        ];
  }),
);
