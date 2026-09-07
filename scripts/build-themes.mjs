#!/usr/bin/env node
/**
 * Themes are generated from `palette.js`. A palette declares fourteen colours;
 * this maps them onto the token set every theme shares.
 *
 * A single-palette theme also gets `dark.css`, the same tokens under `html.dark`.
 * A dual theme covers both modes itself and gets none.
 *
 * `--check` verifies the committed files instead of writing them.
 */

import { readdirSync, readFileSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { themes } from "../packages/jaamd/src/themes/index.js";

const THEMES = join(process.cwd(), "packages", "jaamd", "src", "themes");

/** Token to palette role, in output order. Groups are separated by a blank line. */
const GROUPS = [
  [
    ["bg", "base"],
    ["color-fg", "text"],
    ["color-fg-bright", "bright"],
    ["color-primary", "primary"],
    ["color-primary-light", "primaryLight"],
    ["color-success", "alert.tip"],
  ],
  [["heading-border-color", "primary@0.3"]],
  [
    ["code-bg", "surface"],
    ["code-border", "overlay"],
    ["code-fg", "bright"],
  ],
  [
    ["pre-bg", "base"],
    ["pre-border", "surface"],
    ["pre-fg", "text"],
  ],
  [
    ["copy-btn-bg", "surface"],
    ["copy-btn-border", "overlay"],
    ["copy-btn-fg", "text"],
    ["copy-btn-hover-bg", "overlay"],
    ["copy-btn-hover-border", "primary"],
    ["copy-btn-hover-fg", "bright"],
  ],
  [
    ["blockquote-bg", "base"],
    ["blockquote-border", "overlay"],
    ["blockquote-fg", "primaryLight"],
  ],
  [
    ["em-fg", "accent"],
    ["hr-color", "primary@0.3"],
  ],
  [
    ["table-border", "surface"],
    ["table-header-bg", "base"],
    ["table-hover-bg", "surface"],
  ],
  [
    ["tabs-border", "surface"],
    ["tabs-header-bg", "recessed"],
    ["tabs-btn-hover-bg", "surface"],
    ["tabs-btn-active-bg", "base"],
  ],
  [
    ["details-bg", "base"],
    ["details-border", "surface"],
  ],
  [
    ["spoiler-hidden-color", "bright"],
    ["spoiler-revealed-bg", "surface"],
    ["spoiler-revealed-fg", "text"],
  ],
  ["note", "tip", "important", "warning", "caution"].flatMap((kind) => [
    [`alert-${kind}-color`, `alert.${kind}`],
    [`alert-${kind}-bg`, `alert.${kind}@0.1`],
  ]),
];

export const TOKENS = GROUPS.flat().map(([token]) => token);

const COLUMN = 32;

function rgba(hex, alpha) {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** "surface", "alert.tip", "primary@0.3". */
function resolve(palette, role) {
  const [path, alpha] = role.split("@");
  const value = path.split(".").reduce((o, k) => o?.[k], palette);
  if (value === undefined) throw new Error(`palette is missing "${path}"`);
  return alpha ? rgba(value, alpha) : value;
}

function block(palette, selector) {
  const lines = [`${selector} {`];

  GROUPS.forEach((group, i) => {
    if (i > 0) lines.push("");
    for (const [token, role] of group) {
      const value = palette.overrides?.[token] ?? resolve(palette, role);
      lines.push(`  --jaamd-${token}:`.padEnd(COLUMN) + value + ";");
    }
  });

  return [...lines, "}"].join("\n");
}

/** The CSS a theme's palette produces. `dark` is null for a dual theme. */
export async function render(slug) {
  const path = join(THEMES, slug, "palette.js");
  if (!existsSync(path)) throw new Error(`${slug}: no palette.js`);

  const { light, dark } = (await import(pathToFileURL(path).href)).default;
  const theme = themes.find((t) => t.slug === slug);
  const name = theme?.name ?? slug;
  const shiki =
    typeof theme?.shiki === "string"
      ? `"${theme.shiki}"`
      : `"${theme?.shiki.light}" and "${theme?.shiki.dark}"`;

  const header = (suffix) =>
    `/* JAAMD theme: ${name}${suffix}. Pairs with Shiki theme ${shiki}. */\n\n`;

  if (light && dark) {
    return {
      index:
        header("") + block(light, ":root") + "\n\n" + block(dark, "html.dark") + "\n",
      dark: null,
    };
  }

  const only = light ?? dark;
  return {
    index: header("") + block(only, ":root") + "\n",
    dark: header(" (dark mode only)") + block(only, "html.dark") + "\n",
  };
}

async function run(check) {
  const slugs = readdirSync(THEMES, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();

  const stale = [];

  for (const slug of slugs) {
    const { index, dark } = await render(slug);
    const indexPath = join(THEMES, slug, "index.css");
    const darkPath = join(THEMES, slug, "dark.css");

    if (check) {
      if (!existsSync(indexPath) || readFileSync(indexPath, "utf8") !== index) {
        stale.push(`${slug}/index.css`);
      }
      if (dark === null) {
        if (existsSync(darkPath)) stale.push(`${slug}/dark.css (dual)`);
      } else if (!existsSync(darkPath) || readFileSync(darkPath, "utf8") !== dark) {
        stale.push(`${slug}/dark.css`);
      }
      continue;
    }

    writeFileSync(indexPath, index);
    if (dark === null) {
      if (existsSync(darkPath)) rmSync(darkPath);
      console.log(`✓ ${slug}/index.css`);
    } else {
      writeFileSync(darkPath, dark);
      console.log(`✓ ${slug}/index.css + dark.css`);
    }
  }

  if (!check) return;

  if (stale.length > 0) {
    console.error(
      `✗ stale: ${stale.join(", ")}\n  Run \`pnpm build:themes\` and commit the result.`,
    );
    process.exit(1);
  }
  console.log(`✓ ${slugs.length} theme(s) in sync`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await run(process.argv.includes("--check"));
}
