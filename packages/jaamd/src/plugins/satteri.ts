/** Sätteri mdast and hast plugins. `:::` blocks require `features.directive`. */

import type {
  HastPluginDefinition,
  MdastPluginDefinition,
  MdastVisitorContext,
} from "satteri";
import { TABLE_WRAPPER_CLASS } from "../scripts/utils.js";
import {
  ALERT_MARKER,
  TOC_CLOSE_HTML,
  alertData,
  alertTitle,
  codeTabLabel,
  codeTabsHtml,
  createSlugger,
  headingLinkHtml,
  tocOpenHtml,
} from "./render.js";

/** GitHub-style `> [!NOTE]` alerts. */
export const satteriAlert: MdastPluginDefinition = {
  name: "jaamd-alert",
  blockquote(node, ctx) {
    for (const paragraph of node.children) {
      if (paragraph.type !== "paragraph") continue;

      const [first, second] = paragraph.children;
      const match = first?.type === "text" ? first.value.match(ALERT_MARKER) : null;
      if (!first || first.type !== "text" || !match) continue;

      const alertType = match[1].toLowerCase();

      if (first.value.includes("\n")) {
        ctx.setProperty(
          first,
          "value",
          first.value.replace(ALERT_MARKER, "").replace(/^\n+/, ""),
        );
      } else {
        // Marker is the whole first line: drop it and the following break.
        ctx.removeNode(first);
        if (second?.type === "break") ctx.removeNode(second);
      }

      ctx.setProperty(node, "data", alertData(alertType));
      ctx.prependChild(node, alertTitle(alertType, alertType.toUpperCase()));
      return;
    }
  },
};

// Group counter per document, keyed on its data bag.
const tabGroups = new WeakMap<object, number>();

/** `:::code-tabs` container wrapping fenced blocks. */
export const satteriCodeTabs: MdastPluginDefinition = {
  name: "jaamd-code-tabs",
  containerDirective(node, ctx) {
    if (node.name !== "code-tabs") return;

    const codeNodes = node.children.filter((child) => child.type === "code");
    if (codeNodes.length === 0) return;

    const groupIndex = tabGroups.get(ctx.data) ?? 0;
    tabGroups.set(ctx.data, groupIndex + 1);

    const html = codeTabsHtml(
      `jaamd-tabs-${groupIndex}`,
      codeNodes.map(codeTabLabel),
    );

    ctx.replaceNode(node, [
      { type: "html", value: html.open },
      ...codeNodes.flatMap((codeNode, i) => [
        { type: "html" as const, value: html.panelOpen(i) },
        // Strip meta so Shiki doesn't render it as a title annotation
        { ...codeNode, meta: null },
        { type: "html" as const, value: html.panelClose },
      ]),
      { type: "html", value: html.close },
    ]);
  },
};

/** `:::toc` container: the author's list, wrapped in a landmark. */
export const satteriToc: MdastPluginDefinition = {
  name: "jaamd-toc",
  containerDirective(node, ctx) {
    if (node.name !== "toc") return;

    const children = [...node.children];

    // `[label]` arrives as a flagged paragraph.
    const first = children[0];
    const label =
      first?.type === "paragraph" && first.data?.directiveLabel === true
        ? ctx.textContent(children.shift()!).trim()
        : "";

    if (children.length === 0) return;

    ctx.replaceNode(node, [
      { type: "html", value: tocOpenHtml(label) },
      // Left as mdast: the list renders normally.
      ...children,
      { type: "html", value: TOC_CLOSE_HTML },
    ]);
  },
};

/**
 * Keeps directives no plugin claimed, which Sätteri drops with their content.
 * Blocks become a plain `<div>`, an inline `:name` its source text.
 */
export const satteriDirectiveFallback: MdastPluginDefinition = {
  name: "jaamd-directive-fallback",
  options: { position: true },
  containerDirective: keepAsDiv,
  leafDirective: keepAsDiv,
  textDirective(node, ctx) {
    if (isClaimed(node)) return;
    const { start, end } = node.position ?? {};
    if (start?.offset === undefined || end?.offset === undefined) return;
    ctx.replaceNode(node, { type: "text", value: ctx.source.slice(start.offset, end.offset) });
  },
};

function isClaimed(node: { data?: object | null }): boolean {
  return !!node.data && "hName" in node.data;
}

type BlockDirective = Parameters<
  NonNullable<MdastPluginDefinition["containerDirective" | "leafDirective"]>
>[0];

function keepAsDiv(node: BlockDirective, ctx: MdastVisitorContext): void {
  if (isClaimed(node)) return;
  ctx.setProperty(node, "data", { ...node.data, hName: "div" });
}

/** Wraps tables in a scroll container. */
export const satteriTableWrapper: HastPluginDefinition = {
  name: "jaamd-table-wrapper",
  element: {
    filter: ["table"],
    visit(node, ctx) {
      ctx.wrapNode(node, {
        type: "element",
        tagName: "div",
        properties: { className: [TABLE_WRAPPER_CLASS] },
        children: [],
      });
    },
  },
};

// One slugger per document, keyed on its data bag.
const sluggers = new WeakMap<object, (text: string) => string>();

/**
 * Appends the anchor to headings. Astro assigns ids after user plugins, so the
 * id is set here, with the same slug; Astro keeps an id it finds.
 */
export const satteriHeadingLinks: HastPluginDefinition = {
  name: "jaamd-heading-links",
  element: {
    filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
    visit(node, ctx) {
      const text = ctx.textContent(node);
      // Astro resolves frontmatter expressions in these: left to the client.
      if (text.includes("frontmatter")) return;

      let id = node.properties?.id;
      if (typeof id !== "string") {
        const slug = sluggers.get(ctx.data) ?? createSlugger();
        sluggers.set(ctx.data, slug);
        id = slug(text);
        ctx.setProperty(node, "id", id);
      }
      ctx.appendChild(node, { type: "raw", value: headingLinkHtml(id, text) });
    },
  },
};
