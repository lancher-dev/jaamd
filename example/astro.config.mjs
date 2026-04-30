import { defineConfig } from "astro/config";
import jaamd from "jaamd";

export default defineConfig({
  integrations: [jaamd({ theme: { light: "github-light", dark: "one-dark-pro" } })],
});
