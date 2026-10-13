import { TABLE_WRAPPER_CLASS, qsa } from "../utils.js";

/** Fallback for markup that skipped the build-time plugin. */
export function wrapTables(selector: string): void {
  qsa<HTMLTableElement>(document, `${selector} table`).forEach((table) => {
    if (table.parentElement?.classList.contains(TABLE_WRAPPER_CLASS)) return;
    const wrapper = document.createElement("div");
    wrapper.className = TABLE_WRAPPER_CLASS;
    table.replaceWith(wrapper);
    wrapper.appendChild(table);
  });
}
