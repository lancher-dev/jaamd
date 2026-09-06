#!/usr/bin/env node
/**
 * Post-build assertions on ./www. A green `astro build` proves nothing: jaamd
 * only warns when it cannot register its plugins.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = join(process.cwd(), "www", "dist");
const PAGE = join(DIST, "index.html");

if (!existsSync(PAGE)) {
  console.error(`✗ built page not found: ${PAGE}\n  Did \`pnpm build\` run?`);
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
  "expected the 3 tabs authored in www/src/content/showcase.md",
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

// ─── declared table of contents ──────────────────────────────────────────────

const tocNav = html.match(/<nav class="jaamd-toc"[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? "";

check(
  "toc: nav landmark rendered",
  /<nav class="jaamd-toc" aria-label="[^"]+"/.test(tocNav),
  "remarkToc did not run; it must be registered after remark-directive",
);

check(
  "toc: label rendered as a paragraph",
  tocNav.includes('<p class="jaamd-toc-title">'),
  "the label must not become a heading; it would show up in getHeadings()",
);

check(
  "toc: author's list left intact",
  tocNav.includes("<ul>") && tocNav.includes("<ul>\n<li><a href=\"#third-level\""),
  "the nested list should pass through untouched",
);

// Every entry has to land somewhere.
const tocTargets = [...tocNav.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]);
const dangling = tocTargets.filter(
  (id) => !html.includes(`id="${id}"`),
);

check(
  `toc: all ${tocTargets.length} anchors resolve`,
  tocTargets.length > 0 && dangling.length === 0,
  `no element carries the id(s): ${dangling.join(", ") || "(none found — the TOC is empty)"}`,
);

// Scoped to the markdown: the site chrome around it is not Astro's to slug.
const article =
  html.match(/<article class="jaamd-content"[^>]*>[\s\S]*<\/article>/)?.[0] ?? "";

check(
  "every markdown heading carries an id",
  article !== "" &&
    [...article.matchAll(/<h[1-6](\s[^>]*)?>/g)].every((m) => /\sid="/.test(m[0])),
  "a heading without an id cannot be linked from a TOC",
);

check(
  "toc: scroll offset applies to every heading level",
  css.includes("scroll-margin-top:var(--jaamd-scroll-margin-top,80px)") ||
    css.includes("scroll-margin-top: var(--jaamd-scroll-margin-top, 80px)"),
  "anchored h3-h6 would land flush with the viewport top",
);

check(
  "toc: heading-link hover covers h3-h6",
  css.includes("h6:hover .jaamd-heading-link"),
  "the anchor icon stays invisible on the deeper levels",
);

// ─── themes ──────────────────────────────────────────────────────────────────

const themeSlugs = [
  ...new Set([...html.matchAll(/html\[data-jaamd-theme="([a-z0-9-]+)"\]/g)].map((m) => m[1])),
];

check(
  `themes: ${themeSlugs.length} scoped in the page`,
  themeSlugs.length > 0,
  "the layout did not inject the re-scoped theme CSS",
);

// Authored on :root, so without re-scoping only the last import would ever win.
check(
  "themes: none left on bare :root",
  !/(^|\})\s*:root\s*\{[^}]*--jaamd-color-primary/.test(html),
  "a theme reached the page unscoped and will override every other one",
);

check(
  "themes: the site bridge is scoped too",
  /\[data-jaamd-theme=("?)jaamd\1\]/.test(css),
  "an unscoped bridge outranks the themes, so only secondary colours would change",
);

// One Shiki variable per theme is what lets code follow the switch.
for (const slug of themeSlugs) {
  check(
    `themes: ${slug} has its Shiki colours baked`,
    html.includes(`--shiki-${slug}:`),
    `add ${slug} to shikiConfig.themes, or its code blocks keep the previous theme`,
  );
}

check(
  "themes: the picker lists every theme plus the site's own",
  countOf(/<option value="/g) === themeSlugs.length + 1,
  "the picker is built from the manifest; an option is missing",
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

// Per-element sizes are opt-in fallbacks, so a minifier dropping them would go
// unnoticed until someone tried to set one.
check(
  "per-element font size tokens shipped",
  css.includes("--jaamd-font-size-h1") &&
    css.includes("--jaamd-font-size-code-block"),
  "the font-size fallbacks did not survive into the built CSS",
);

// In dual mode Shiki only sets --shiki-light/--shiki-dark; without these rules
// code renders with no colour at all.
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
