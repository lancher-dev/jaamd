import { defineConfig, fontProviders } from "astro/config";
import jaamd from "@lancher-dev/jaamd";

export default defineConfig({
  site: "https://jaamd.lancher.dev",
  integrations: [jaamd({ theme: { light: "github-light", dark: "one-dark-pro" } })],
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
