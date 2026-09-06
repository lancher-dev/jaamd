import { qsa } from "../utils.js";

export function wrapTables(selector: string): void {
  qsa<HTMLTableElement>(document, `${selector} table`).forEach((table) => {
    if (table.parentElement?.classList.contains("jaamd-table-wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "jaamd-table-wrapper";
    table.replaceWith(wrapper);
    wrapper.appendChild(table);
  });
}
