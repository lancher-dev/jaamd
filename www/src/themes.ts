import { themes as packageThemes } from "@lancher-dev/jaamd/themes";

export type SiteThemeMode = "light" | "dark" | "system";

export interface SiteTheme {
  slug: string;
  name: string;
  mode: SiteThemeMode;
}

/** The site's own palette, and the only entry that follows the operating system. */
export const SITE_THEME: SiteTheme = {
  slug: "jaamd",
  name: "JAAMD",
  mode: "system",
};

export const siteThemes: SiteTheme[] = [SITE_THEME, ...packageThemes];

export const THEME_STORAGE_KEY = "jaamd-theme";

/** slug → mode, the only thing the picker and the boot script need to agree on. */
export const themeModes: Record<string, SiteThemeMode> = Object.fromEntries(
  siteThemes.map((t) => [t.slug, t.mode]),
);
