import { defineConfig } from "astro/config";
import jaamd from "@lancher-dev/jaamd";

export default defineConfig({
  site: "https://jaamd.lancher.dev",
  integrations: [jaamd({ theme: { light: "github-light", dark: "one-dark-pro" } })],
});
