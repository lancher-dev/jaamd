import { qsa } from "../utils.js";

// ─── Responsive table wrapper ─────────────────────────────────────────────────

export function wrapTables(selector: string): void {
  qsa<HTMLTableElement>(document, `${selector} table`).forEach((table) => {
    if (table.parentElement?.classList.contains("jaamd-table-wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "jaamd-table-wrapper";
    table.parentNode!.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}
