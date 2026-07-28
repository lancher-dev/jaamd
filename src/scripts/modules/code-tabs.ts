import { qsa } from "../utils.js";

// ─── Code tabs ────────────────────────────────────────────────────────────────

/**
 * Wires up the tablists emitted by the `:::code-tabs` remark plugin, following
 * the WAI-ARIA tabs pattern: class, `aria-selected` and the roving `tabindex`
 * always change together, and Arrow/Home/End move between tabs.
 */
export function initCodeTabs(selector: string = ".jaamd-content"): void {
  qsa<HTMLElement>(document, `${selector} .code-tabs`).forEach((group) => {
    if (group.dataset.tabsInit) return;
    group.dataset.tabsInit = "1";

    const buttons = Array.from(qsa<HTMLButtonElement>(group, ".code-tab-btn"));
    if (buttons.length === 0) return;

    const select = (index: number, moveFocus: boolean): void => {
      buttons.forEach((btn, i) => {
        const isActive = i === index;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", String(isActive));
        btn.tabIndex = isActive ? 0 : -1;
      });

      qsa<HTMLElement>(group, ".code-tab-panel").forEach((panel) => {
        panel.classList.toggle("active", panel.dataset.tabIndex === String(index));
      });

      if (moveFocus) buttons[index].focus();
    };

    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => select(i, false));

      btn.addEventListener("keydown", (e) => {
        const last = buttons.length - 1;
        let next: number | null = null;

        if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
        else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = last;

        if (next === null) return;
        // Stop the host page treating these as page-level shortcuts.
        e.preventDefault();
        e.stopPropagation();
        select(next, true);
      });
    });

    // Re-assert so class, aria-selected and tabindex agree even if the markup
    // came from an older version of the plugin.
    const initial = buttons.findIndex((b) => b.classList.contains("active"));
    select(initial === -1 ? 0 : initial, false);
  });
}
