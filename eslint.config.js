import js from "@eslint/js";
import astro from "eslint-plugin-astro";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/.astro/**"],
  },

  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,

  {
    rules: {
      eqeqeq: ["error", "always"],
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    files: ["index.ts", "src/paths.ts", "src/plugins/**/*.ts", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },

  {
    files: ["src/scripts/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },

  // Remark works on mdast nodes carrying `data.hName`/`data.hProperties`, which
  // @types/mdast does not model.
  {
    files: ["src/plugins/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },

  {
    files: ["scripts/**/*.mjs"],
    rules: { "no-console": "off" },
  },
);
