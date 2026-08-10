#!/usr/bin/env node
/**
 * Post-build smoke test for the example site.
 *
 * When jaamd cannot recognise Astro's default markdown processor it logs a
 * warning and skips its remark plugins, and the build still exits 0. So a green
 * build proves nothing about whether alerts and code-tabs rendered. Asserting on
 * the produced HTML is what catches Astro renaming that processor.
 *
 * Usage: node scripts/smoke-test.mjs  (after building ./example)
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "example", "dist");
const PAGE = join(DIST, "demo", "index.html");

if (!existsSync(PAGE)) {
  console.error(`✗ built page not found: ${PAGE}\n  Did \`npm run build\` run in ./example?`);
  process.exit(1);
}

const html = readFileSync(PAGE, "utf8");

// Stylesheets the page actually links, concatenated.
const css = [...html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
  .map((m) => join(DIST, m[1].replace(/^\//, "")))
  .filter(existsSync)
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

/** @type {{ name: string, ok: boolean, hint: string }[]} */
const results = [];

const check = (name, condition, hint) =>
  results.push({ name, ok: Boolean(condition), hint });

const countOf = (re) => (html.match(re) ?? []).length;

// ─── remark plugins actually ran ─────────────────────────────────────────────

for (const type of ["note", "tip", "important", "warning", "caution"]) {
  check(
    `alert: ${type}`,
    html.includes(`markdown-alert-${type}`),
    "remarkAlert did not run; check the markdown.processor detection in index.ts",
  );
}

check(
  "code-tabs: container rendered",
  html.includes('class="code-tabs"'),
  "remarkCodeTabs did not run; remark-directive may not be registered before it",
);

check(
  "code-tabs: one panel per code block",
  countOf(/class="code-tab-panel/g) === 3,
  "expected the 3 tabs authored in example/src/pages/demo.md",
);

// ─── accessibility wiring the client script relies on ────────────────────────

check(
  "code-tabs: tabs linked to panels",
  countOf(/aria-controls="jaamd-tabs-\d+-panel-\d+"/g) === 3,
  "each tab must reference its panel via aria-controls",
);

check(
  "code-tabs: panels linked back to tabs",
  countOf(/aria-labelledby="jaamd-tabs-\d+-tab-\d+"/g) === 3,
  "each panel must reference its tab via aria-labelledby",
);

check(
  "code-tabs: exactly one tab pre-selected",
  countOf(/role="tab" aria-selected="true"/g) === 1,
  "the first tab, and only the first, should start selected",
);

check(
  "code-tabs: roving tabindex in the markup",
  countOf(/tabindex="-1"/g) === 2,
  "unselected tabs must be removed from the tab order",
);

// ─── the rest of the pipeline still ships ────────────────────────────────────

check(
  "syntax highlighting applied",
  /class="[^"]*(astro-code|shiki)/.test(html),
  "Shiki did not highlight; check shikiConfig merging",
);

check(
  "stylesheet linked",
  /<link[^>]+rel="stylesheet"/.test(html),
  "no stylesheet reached the page; the CSS import chain is broken",
);

check(
  "markdown styles shipped",
  css.includes("--jaamd-"),
  "markdown.css did not reach the linked stylesheets",
);

// Shiki emits only --shiki-light/--shiki-dark on spans in dual mode; without the
// rules that read them, code renders with no colour at all.
check(
  "dual-theme code colours shipped",
  css.includes("var(--shiki-light)") && css.includes("var(--shiki-dark)"),
  "shiki-dual.css did not reach the CSS; inject it at the page-ssr stage, not page",
);

check(
  "client enhancements bundled",
  /<script[^>]+type="module"/.test(html),
  "the injected page script did not make it into the build",
);

// ─── report ──────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.ok);

for (const r of results) {
  console.log(`${r.ok ? "✓" : "✗"} ${r.name}${r.ok ? "" : `\n    → ${r.hint}`}`);
}

console.log(
  `\n${results.length - failed.length}/${results.length} checks passed`,
);

if (failed.length > 0) {
  console.error(
    `\n${failed.length} check(s) failed. The build succeeded but the markdown ` +
      `pipeline did not produce the expected output.`,
  );
  process.exit(1);
}
