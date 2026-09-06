#!/usr/bin/env node
/**
 * `slugify()` fills in ids for headings that arrived without one. Astro's own
 * ids come from `github-slugger`, so the two have to agree.
 *
 * Node strips the types from the .ts import natively (>=22.18 / 24).
 */

import Slugger from "github-slugger";
import { slugify } from "../src/scripts/utils.ts";

const cases = [
  "Feature Demo",
  // One dash per space; the slash goes, the spaces stay.
  "Details / accordion",
  // Underscores are kept.
  "my_heading",
  "What's new?",
  "C++ & Rust",
  "Hello 🎉 World",
  "Table (v2) — notes",
  "100% done",
  "@media queries",
  "dot.case.name",
  // `\w` would collapse these to "".
  "Заголовок раздела",
  "日本語の見出し",
  "Ünicode Ärger",
  // No trimming at either end.
  "  padded  ",
  "trailing dash -",
];

const results = cases.map((text) => {
  const expected = new Slugger().slug(text);
  const actual = slugify(text);
  return { text, expected, actual, ok: expected === actual };
});

for (const r of results) {
  console.log(
    `${r.ok ? "✓" : "✗"} ${JSON.stringify(r.text)} → ${JSON.stringify(r.actual)}` +
      (r.ok ? "" : `\n    → github-slugger says ${JSON.stringify(r.expected)}`),
  );
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} slugs match`);

if (failed.length > 0) {
  console.error(
    `\n${failed.length} slug(s) diverge from github-slugger; client-side ids ` +
      `would not match the ones Astro emits.`,
  );
  process.exit(1);
}
