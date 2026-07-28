import { visit } from "unist-util-visit";
import type { Plugin } from "unified";
import type { Root } from "mdast";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

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
    // Per-document, so several blocks on one page get distinct ids.
    let groupIndex = 0;

    visit(tree, "containerDirective", (node: any, index, parent: any) => {
      if (node.name !== "code-tabs") return;
      if (index === undefined || !parent) return;

      const codeNodes = node.children.filter(
        (child: any) => child.type === "code",
      );
      if (codeNodes.length === 0) return;

      const group = `jaamd-tabs-${groupIndex++}`;
      const tabId = (i: number) => `${group}-tab-${i}`;
      const panelId = (i: number) => `${group}-panel-${i}`;

      const labels: string[] = codeNodes.map(
        (cn: any, i: number) => cn.meta || cn.lang || `Tab ${i + 1}`,
      );

      const buttons = labels
        .map((label, i) => {
          const selected = i === 0;
          return (
            `<button class="code-tab-btn${selected ? " active" : ""}" ` +
            `id="${tabId(i)}" data-tab-index="${i}" role="tab" ` +
            `aria-selected="${selected}" aria-controls="${panelId(i)}" ` +
            // Roving tabindex: only the selected tab is in the tab order.
            `tabindex="${selected ? 0 : -1}">${escapeHtml(label)}</button>`
          );
        })
        .join("");

      const openHtml =
        `<div class="code-tabs" id="${group}">` +
        `<div class="code-tab-buttons" role="tablist">${buttons}</div>`;

      const replacement: any[] = [{ type: "html", value: openHtml }];

      codeNodes.forEach((codeNode: any, i: number) => {
        replacement.push({
          type: "html",
          value:
            `<div class="code-tab-panel${i === 0 ? " active" : ""}" ` +
            `id="${panelId(i)}" data-tab-index="${i}" role="tabpanel" ` +
            // Focusable so wide samples can be scrolled by keyboard.
            `aria-labelledby="${tabId(i)}" tabindex="0">`,
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