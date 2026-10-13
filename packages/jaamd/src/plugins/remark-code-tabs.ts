import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";
import { codeTabLabel, codeTabsHtml } from "./render.js";

/**
 * Tabbed code blocks: a `:::code-tabs` container wrapping fenced blocks.
 * The meta string after the language is the tab label, falling back to the
 * language, then "Tab N".
 *
 * Requires remark-directive to run before this plugin.
 */
const remarkCodeTabs: Plugin<[], Root> = () => {
  return (tree: Root) => {
    // Per-document, so several blocks on one page get distinct ids.
    let groupIndex = 0;

    visit(tree, "containerDirective", (node: any, index, parent: any) => {
      if (node.name !== "code-tabs") return;
      if (index === undefined || !parent) return;

      const codeNodes = node.children.filter(
        (child: any) => child.type === "code",
      );
      if (codeNodes.length === 0) return;

      const html = codeTabsHtml(
        `jaamd-tabs-${groupIndex++}`,
        codeNodes.map(codeTabLabel),
      );

      const replacement: any[] = [{ type: "html", value: html.open }];

      codeNodes.forEach((codeNode: any, i: number) => {
        replacement.push({ type: "html", value: html.panelOpen(i) });
        // Strip meta so Shiki doesn't render it as a title annotation
        replacement.push({ ...codeNode, meta: null });
        replacement.push({ type: "html", value: html.panelClose });
      });

      replacement.push({ type: "html", value: html.close });
      parent.children.splice(index, 1, ...replacement);

      return index + replacement.length;
    });
  };
};

export default remarkCodeTabs;