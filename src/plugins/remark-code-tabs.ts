import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

/**
 * Remark plugin: tabbed code blocks.
 *
 * Syntax:
 * :::code-tabs
 * ```bash npm
 * npm install
 * ```
 * ```bash pnpm
 * pnpm install
 * ```
 * :::
 *
 * The meta string (text after the language) becomes the tab label.
 * Falls back to the language identifier, then "Tab N".
 *
 * Requires remark-directive to be registered before this plugin.
 */
const remarkCodeTabs: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node: any, index, parent: any) => {
      if (node.name !== "code-tabs") return;
      if (index === undefined || !parent) return;

      const codeNodes = node.children.filter(
        (child: any) => child.type === "code",
      );
      if (codeNodes.length === 0) return;

      const labels: string[] = codeNodes.map(
        (cn: any, i: number) => cn.meta || cn.lang || `Tab ${i + 1}`,
      );

      const buttons = labels
        .map(
          (label, i) =>
            `<button class="code-tab-btn${i === 0 ? " active" : ""}" ` +
            `data-tab-index="${i}" role="tab" aria-selected="${i === 0}">${label}</button>`,
        )
        .join("");

      const openHtml =
        `<div class="code-tabs">` +
        `<div class="code-tab-buttons" role="tablist">${buttons}</div>`;

      const replacement: any[] = [{ type: "html", value: openHtml }];

      codeNodes.forEach((codeNode: any, i: number) => {
        replacement.push({
          type: "html",
          value:
            `<div class="code-tab-panel${i === 0 ? " active" : ""}" ` +
            `data-tab-index="${i}" role="tabpanel">`,
        });
        // Strip meta so Shiki doesn't render it as a title annotation
        replacement.push({ ...codeNode, meta: null });
        replacement.push({ type: "html", value: `</div>` });
      });

      replacement.push({ type: "html", value: `</div>` });
      parent.children.splice(index, 1, ...replacement);

      return index + replacement.length;
    });
  };
};

export default remarkCodeTabs;