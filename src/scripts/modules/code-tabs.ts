import { qs, qsa } from "../utils.js";

// ─── Code tabs ────────────────────────────────────────────────────────────────

export function initCodeTabs(): void {
  qsa<HTMLElement>(document, ".code-tabs").forEach((group) => {
    if (group.dataset.tabsInit) return;
    group.dataset.tabsInit = "1";

    qsa<HTMLButtonElement>(group, ".code-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.tabIndex;
        qsa(group, ".code-tab-btn").forEach((b) =>
          b.classList.remove("active"),
        );
        qsa(group, ".code-tab-panel").forEach((p) =>
          p.classList.remove("active"),
        );
        btn.classList.add("active");
        qs(group, `.code-tab-panel[data-tab-index="${idx}"]`)?.classList.add(
          "active",
        );
      });
    });
  });
}
