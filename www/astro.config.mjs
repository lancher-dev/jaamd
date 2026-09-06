import { defineConfig } from "astro/config";
import jaamd from "@lancher-dev/jaamd";

export default defineConfig({
  integrations: [jaamd({ theme: { light: "github-light", dark: "one-dark-pro" } })],
});
