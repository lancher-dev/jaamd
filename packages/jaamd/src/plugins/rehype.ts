/** rehype plugins for the unified processor. */

import type { RehypePlugin } from "@astrojs/markdown-remark";
import type { Element, ElementContent } from "hast";
import { visit } from "unist-util-visit";
import { TABLE_WRAPPER_CLASS } from "../scripts/utils.js";
import { createSlugger, headingLinkHtml } from "./render.js";

/** Wraps tables in a scroll container. */
export const rehypeTableWrapper: RehypePlugin<[]> = () => (tree) => {
  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== "table" || index === undefined || !parent) return;

    const wrapper: Element = {
      type: "element",
      tagName: "div",
      properties: { className: [TABLE_WRAPPER_CLASS] },
      children: [node],
    };
    parent.children[index] = wrapper;
    return index + 1;
  });
};

/** Text Astro slugs: text nodes, raw HTML tags left out. */
function textOf(node: ElementContent): string {
  if (node.type === "text") return node.value;
  return "children" in node ? node.children.map(textOf).join("") : "";
}

function hasExpression(node: ElementContent): boolean {
  if ((node.type as string) === "mdxTextExpression") return true;
  return "children" in node && node.children.some(hasExpression);
}

/**
 * Appends the anchor to headings. Astro assigns ids after user plugins, so the
 * id is set here, with the same slug; Astro keeps an id it finds.
 */
export const rehypeHeadingLinks: RehypePlugin<[]> = () => (tree) => {
  const slug = createSlugger();

  visit(tree, "element", (node) => {
    if (!/^h[1-6]$/.test(node.tagName)) return;
    // Astro resolves MDX expressions in these: left to the client.
    if (hasExpression(node)) return;

    const text = textOf(node);
    const id = typeof node.properties.id === "string" ? node.properties.id : slug(text);
    node.properties.id = id;

    node.children.push({
      type: "raw",
      value: headingLinkHtml(id, text),
    } as unknown as ElementContent);
  });
};
