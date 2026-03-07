import { qsa } from "../utils.js";

// ─── Spoilers ─────────────────────────────────────────────────────────────────

export function initSpoilers(selector: string): void {
  qsa<HTMLElement>(document, `${selector} .spoiler`).forEach((el) => {
    if (el.dataset.spoilerInit) return;
    el.dataset.spoilerInit = "1";
    el.addEventListener("click", () => el.classList.toggle("revealed"));
  });
}
