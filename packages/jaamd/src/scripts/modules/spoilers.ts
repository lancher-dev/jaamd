import { qsa } from "../utils.js";

/** `.spoiler` is authored as plain markup; this gives it button semantics so it
 *  is reachable without a mouse. */
export function initSpoilers(selector: string): void {
  qsa<HTMLElement>(document, `${selector} .spoiler`).forEach((el) => {
    if (el.dataset.spoilerInit) return;
    el.dataset.spoilerInit = "1";

    if (!el.hasAttribute("tabindex")) el.tabIndex = 0;
    if (!el.hasAttribute("role")) el.setAttribute("role", "button");
    el.setAttribute("aria-expanded", String(el.classList.contains("revealed")));
    if (!el.hasAttribute("aria-label")) el.setAttribute("aria-label", "Spoiler");

    const toggle = (): void => {
      const revealed = el.classList.toggle("revealed");
      el.setAttribute("aria-expanded", String(revealed));
    };

    el.addEventListener("click", toggle);
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      e.preventDefault(); // Space would scroll the page
      toggle();
    });
  });
}
