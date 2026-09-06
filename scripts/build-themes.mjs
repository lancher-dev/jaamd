#!/usr/bin/env node
/**
 * `dark.css` is `index.css` under `html.dark`, generated rather than kept in
 * sync by hand.
 *
 * `--check` verifies the committed files instead of writing them.
 */

import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { themes } from "../packages/jaamd/src/themes/index.js";

const THEMES = join(process.cwd(), "packages", "jaamd", "src", "themes");

/** A dual theme carries both palettes; it gets no dark variant. */
const isDual = (slug) => themes.find((t) => t.slug === slug)?.mode === "dual";

/** The dark variant of a theme's source. */
export function darkVariant(source) {
  return source
    .replace(/^(\/\* JAAMD theme: [^.]+)\./m, "$1 (dark mode only).")
    .replace(/^:root \{$/m, "html.dark {");
}

function run(check) {
  const slugs = readdirSync(THEMES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const stale = [];

  for (const slug of slugs) {
    const path = join(THEMES, slug, "dark.css");

    if (isDual(slug)) {
      if (check) {
        if (existsSync(path)) stale.push(`${slug} (dual, should have no dark.css)`);
      } else if (existsSync(path)) {
        rmSync(path);
        console.log(`✓ ${slug}/dark.css removed (dual)`);
      }
      continue;
    }

    const source = readFileSync(join(THEMES, slug, "index.css"), "utf8");
    const expected = darkVariant(source);

    if (check) {
      if (!existsSync(path) || readFileSync(path, "utf8") !== expected) stale.push(slug);
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
