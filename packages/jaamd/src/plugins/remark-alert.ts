/**
 * GitHub-style blockquote alerts. Inlined from remark-github-blockquote-alert
 * (MIT) to keep it out of consumer dependencies.
 * https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
 */

import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { ALERT_LEGACY_MARKER, ALERT_MARKER, alertData, alertTitle } from "./render.js";

export interface RemarkAlertOptions {
  /** Use legacy title format (allows optional slash-suffix). @default false */
  legacyTitle?: boolean;
  /** HTML tag name for the alert wrapper. @default "div" */
  tagName?: string;
}

export function remarkAlert(options: RemarkAlertOptions = {}) {
  const { legacyTitle = false, tagName = "div" } = options;
  const marker = legacyTitle ? ALERT_LEGACY_MARKER : ALERT_MARKER;

  return (tree: Root) => {
    visit(tree, "blockquote", (node: any) => {
      for (const paragraph of node.children) {
        if (paragraph.type !== "paragraph") continue;

        const first = paragraph.children[0];
        const match = first?.type === "text" ? first.value.match(marker) : null;
        if (!match) continue;

        const alertType = match[1].toLowerCase();
        const title = (
          legacyTitle && match[2] ? match[2] : alertType.toUpperCase()
        ).replace(/^\//, "");

        if (first.value.includes("\n")) {
          paragraph.children[0] = {
            type: "text",
            value: first.value.replace(marker, "").replace(/^\n+/, ""),
          };
        } else {
          // Marker is the whole first line: drop it and the following break.
          paragraph.children.splice(
            0,
            paragraph.children[1]?.type === "break" ? 2 : 1,
          );
        }

        node.data = alertData(alertType, tagName);
        node.children.unshift(alertTitle(alertType, title));
        return;
      }
    });
  };
}

export default remarkAlert;
