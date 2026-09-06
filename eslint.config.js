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
    files: [
      "packages/jaamd/index.ts",
      "packages/jaamd/src/paths.ts",
      "packages/jaamd/src/plugins/**/*.ts",
      "tests/**/*.mjs",
    ],
    languageOptions: { globals: globals.node },
  },

  {
    files: ["packages/jaamd/src/scripts/**/*.ts", "www/src/**/*.astro"],
    languageOptions: { globals: globals.browser },
  },

  // Remark works on mdast nodes carrying `data.hName`/`data.hProperties`, which
  // @types/mdast does not model.
  {
    files: ["packages/jaamd/src/plugins/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "off" },
  },

  {
    files: ["tests/**/*.mjs"],
    rules: { "no-console": "off" },
  },
);
