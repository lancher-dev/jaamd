import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import { TOC_CLOSE_HTML, tocOpenHtml } from "./render.js";

/** Plain text of a label paragraph. */
function textOf(node: any): string {
  if (typeof node?.value === "string") return node.value;
  if (!Array.isArray(node?.children)) return "";
  return node.children.map(textOf).join("");
}

/**
 * Declared table of contents: a `:::toc` container wrapped in a landmark. The
 * list is the author's, nothing is generated. The optional directive label
 * becomes the title.
 *
 *     :::toc[On this page]
 *     - [Setup](#setup)
 *     :::
 *
 * Requires remark-directive to run before this plugin.
 */
const remarkToc: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node: any, index, parent: any) => {
      if (node.name !== "toc") return;
      if (index === undefined || !parent) return;

      const children: any[] = [...node.children];

      // remark-directive puts `[label]` in a flagged paragraph.
      const first = children[0];
      const label =
        first?.data?.directiveLabel === true
          ? textOf(children.shift()).trim()
          : "";

      if (children.length === 0) return;

      const replacement: any[] = [
        { type: "html", value: tocOpenHtml(label) },
        // Left as mdast: the list renders normally.
        ...children,
        { type: "html", value: TOC_CLOSE_HTML },
      ];

      parent.children.splice(index, 1, ...replacement);

      return index + replacement.length;
    });
  };
};

export default remarkToc;
