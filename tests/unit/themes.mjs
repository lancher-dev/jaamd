#!/usr/bin/env node
/**
 * The theme contract. A theme that omits a token still builds; the defect only
 * shows up on screen.
 */

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { bundledThemes } from "shiki";

import { themes, REQUIRED_TOKENS } from "../../packages/jaamd/src/themes/index.js";
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
    "add it to packages/jaamd/src/themes/index.js, or pickers will never show it",
  );
  if (!entry) continue;

  const dual = entry.mode === "dual";

  check(
    `${slug}: mode is light, dark or dual`,
    ["light", "dark", "dual"].includes(entry.mode),
    `mode was ${JSON.stringify(entry.mode)}; consumers use it to decide html.dark`,
  );

  const shiki =
    typeof entry.shiki === "string" ? [entry.shiki] : Object.values(entry.shiki ?? {});
  const unknown = shiki.filter((name) => !Object.hasOwn(bundledThemes, name));

  check(
    `${slug}: pairs with real Shiki theme(s)`,
    shiki.length > 0 && unknown.length === 0,
    unknown.length
      ? `not bundled by Shiki: ${unknown.join(", ")}`
      : "no Shiki theme declared",
  );

  check(
    `${slug}: a dual theme declares a Shiki pair`,
    !dual || (typeof entry.shiki === "object" && entry.shiki.light && entry.shiki.dark),
    "a dual palette needs a light and a dark Shiki theme to match it",
  );

  const indexPath = join(THEMES, slug, "index.css");
  const darkPath = join(THEMES, slug, "dark.css");

  if (!existsSync(indexPath)) {
    check(`${slug}: has index.css`, false, "a theme is a directory with index.css");
    continue;
  }

  const source = readFileSync(indexPath, "utf8");

  // A dual theme carries the seeds in both blocks; otherwise one mode borrows
  // the other's background.
  const blocks = dual
    ? source.split(/^html\.dark \{$/m)
    : [source];

  check(
    `${slug}: has both a light and a dark block`,
    !dual || blocks.length === 2,
    "a dual theme needs a :root block and an html.dark one",
  );

  const missing = REQUIRED_TOKENS.filter((token) =>
    blocks.some((b) => !new RegExp(`^\\s*${token}\\s*:`, "m").test(b)),
  );

  check(
    `${slug}: declares every required seed`,
    missing.length === 0,
    `missing ${missing.join(", ")}: derived tokens fall back to the default palette`,
  );

  check(
    `${slug}: dark.css matches its mode`,
    dual
      ? !existsSync(darkPath)
      : existsSync(darkPath) && readFileSync(darkPath, "utf8") === darkVariant(source),
    dual
      ? "a dual theme already covers dark mode; it must not ship a /dark variant"
      : "run `pnpm build:themes` and commit the result",
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
