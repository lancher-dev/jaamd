#!/usr/bin/env node
/**
 * The theme contract. Without this, a theme that omits a token still builds and
 * the defect only shows up on screen months later — which is exactly how the
 * `:::toc` card ended up unstyled under every preset.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { bundledThemes } from "shiki";

import { themes, REQUIRED_TOKENS } from "../../packages/jaamd/src/themes/index.ts";
import { darkVariant } from "../../scripts/build-themes.mjs";

const THEMES = join(process.cwd(), "packages", "jaamd", "src", "themes");

const results = [];
const check = (name, condition, hint) =>
  results.push({ name, ok: Boolean(condition), hint });

const slugs = readdirSync(THEMES, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

// ─── every directory is a complete, declared theme ───────────────────────────

for (const slug of slugs) {
  const entry = themes.find((t) => t.slug === slug);

  check(
    `${slug}: declared in the manifest`,
    entry,
    "add it to packages/jaamd/src/themes/index.ts, or pickers will never show it",
  );
  if (!entry) continue;

  check(
    `${slug}: mode is light or dark`,
    entry.mode === "light" || entry.mode === "dark",
    `mode was ${JSON.stringify(entry.mode)}; consumers use it to set html.dark`,
  );

  check(
    `${slug}: pairs with a real Shiki theme`,
    Object.hasOwn(bundledThemes, entry.shiki),
    `"${entry.shiki}" is not a bundled Shiki theme`,
  );

  const indexPath = join(THEMES, slug, "index.css");
  const darkPath = join(THEMES, slug, "dark.css");

  if (!existsSync(indexPath)) {
    check(`${slug}: has index.css`, false, "a theme is a directory with index.css");
    continue;
  }

  const source = readFileSync(indexPath, "utf8");
  const missing = REQUIRED_TOKENS.filter(
    (token) => !new RegExp(`^\\s*${token}\\s*:`, "m").test(source),
  );

  check(
    `${slug}: declares every required seed`,
    missing.length === 0,
    `missing ${missing.join(", ")} — derived tokens would fall back to the default palette`,
  );

  check(
    `${slug}: dark.css is in sync`,
    existsSync(darkPath) && readFileSync(darkPath, "utf8") === darkVariant(source),
    "run `pnpm build:themes` and commit the result",
  );
}

// ─── and nothing is declared that does not exist ─────────────────────────────

const orphans = themes.filter((t) => !slugs.includes(t.slug)).map((t) => t.slug);

check(
  "manifest has no orphan entries",
  orphans.length === 0,
  `no directory for: ${orphans.join(", ")}`,
);

// ─── report ──────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.ok);

for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok ? "" : `\n    → ${r.hint}`}`);
}

console.log(`\n${results.length - failed.length}/${results.length} checks passed`);

if (failed.length > 0) {
  console.error(`\n${failed.length} check(s) failed. The theme contract is not met.`);
  process.exit(1);
}
