import { defineConfig, fontProviders } from "astro/config";
import jaamd from "@lancher-dev/jaamd";
import { themes } from "@lancher-dev/jaamd/themes";

// Shiki takes arbitrary theme keys and emits --shiki-<key> per token, so every
// theme is baked at build time and switched with CSS. jaamd's own option accepts
// only light/dark, so the rest are added here, after it.
const shikiThemes = {
  light: "github-light",
  dark: "one-dark-pro",
  ...Object.fromEntries(themes.map((t) => [t.slug, t.shiki])),
};

/** @type {import("astro").AstroIntegration} */
const shikiMultiTheme = {
  name: "www:shiki-themes",
  hooks: {
    "astro:config:setup": ({ updateConfig }) => {
      updateConfig({
        markdown: { shikiConfig: { themes: shikiThemes, defaultColor: false } },
      });
    },
  },
};

export default defineConfig({
  site: "https://jaamd.lancher.dev",
  integrations: [
    jaamd({ theme: { light: "github-light", dark: "one-dark-pro" } }),
    shikiMultiTheme,
  ],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["400 600"],
    },
    {
      provider: fontProviders.google(),
      name: "Merriweather",
      cssVariable: "--font-merriweather",
      weights: ["300 700"],
      styles: ["normal", "italic"],
    },
  ],
});
