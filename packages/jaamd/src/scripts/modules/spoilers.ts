import { qsa } from "../utils.js";

const INITIALIZED = ".spoiler[data-spoiler-init]";

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
  });
}

function toggle(el: Element): void {
  const revealed = el.classList.toggle("revealed");
  el.setAttribute("aria-expanded", String(revealed));
}

export function onSpoilerClick(target: Element): void {
  const el = target.closest(INITIALIZED);
  if (el) toggle(el);
}

export function onSpoilerKeydown(target: Element, e: KeyboardEvent): void {
  if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
  // The spoiler itself, not a focusable child.
  if (!target.matches(INITIALIZED)) return;
  e.preventDefault(); // Space would scroll the page
  toggle(target);
}
