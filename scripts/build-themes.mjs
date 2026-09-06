#!/usr/bin/env node
/**
 * `dark.css` is `index.css` under `html.dark`. Generated rather than kept in
 * sync by hand: the two share every token, and a typo in one used to show up in
 * only one mode.
 *
 * `--check` verifies the committed files instead of writing them.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const THEMES = join(process.cwd(), "packages", "jaamd", "src", "themes");

/** The dark variant of a theme's source. */
export function darkVariant(source) {
  return source
    .replace(/^(\/\* JAAMD theme — [^.]+)\./m, "$1 (dark mode only).")
    .replace(/^:root \{$/m, "html.dark {");
}

function run(check) {
  const slugs = readdirSync(THEMES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const stale = [];

  for (const slug of slugs) {
    const source = readFileSync(join(THEMES, slug, "index.css"), "utf8");
    const expected = darkVariant(source);
    const path = join(THEMES, slug, "dark.css");

    if (check) {
      if (readFileSync(path, "utf8") !== expected) stale.push(slug);
      continue;
    }

    writeFileSync(path, expected);
    console.log(`✓ ${slug}/dark.css`);
  }

  if (!check) return;

  if (stale.length > 0) {
    console.error(
      `✗ stale dark.css: ${stale.join(", ")}\n  Run \`pnpm build:themes\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`✓ ${slugs.length} theme(s) in sync`);
}

// Importing this module must not rewrite the files it is used to verify.
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run(process.argv.includes("--check"));
}
