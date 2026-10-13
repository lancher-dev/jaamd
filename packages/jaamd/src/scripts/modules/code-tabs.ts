import { qsa } from "../utils.js";

const GROUP = ".code-tabs[data-tabs-init]";
const BUTTON = ".code-tab-btn";

const buttonsOf = (group: Element): HTMLButtonElement[] =>
  Array.from(qsa<HTMLButtonElement>(group, BUTTON));

/** Class, `aria-selected` and the roving `tabindex` always change together
 *  (WAI-ARIA tabs pattern). */
function select(group: Element, index: number, moveFocus: boolean): void {
  const buttons = buttonsOf(group);

  buttons.forEach((btn, i) => {
    const isActive = i === index;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", String(isActive));
    btn.tabIndex = isActive ? 0 : -1;
  });

  qsa<HTMLElement>(group, ".code-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.tabIndex === String(index));
  });

  if (moveFocus) buttons[index]?.focus();
}

/** Marks the tablists emitted by the `:::code-tabs` plugin as live. */
export function initCodeTabs(selector: string): void {
  qsa<HTMLElement>(document, `${selector} .code-tabs`).forEach((group) => {
    if (group.dataset.tabsInit) return;
    group.dataset.tabsInit = "1";

    const buttons = buttonsOf(group);
    if (buttons.length === 0) return;

    // Re-assert so class, aria-selected and tabindex start out in agreement.
    const initial = buttons.findIndex((b) => b.classList.contains("active"));
    select(group, initial === -1 ? 0 : initial, false);
  });
}

function locate(target: Element): { group: Element; index: number; last: number } | null {
  const btn = target.closest<HTMLButtonElement>(BUTTON);
  const group = btn?.closest(GROUP);
  if (!btn || !group) return null;

  const buttons = buttonsOf(group);
  return { group, index: buttons.indexOf(btn), last: buttons.length - 1 };
}

export function onTabClick(target: Element): void {
  const tab = locate(target);
  if (tab) select(tab.group, tab.index, false);
}

/** Arrow/Home/End move between tabs. */
export function onTabKeydown(target: Element, e: KeyboardEvent): void {
  const tab = locate(target);
  if (!tab) return;

  const { index, last } = tab;
  let next: number | null = null;

  if (e.key === "ArrowRight") next = index === last ? 0 : index + 1;
  else if (e.key === "ArrowLeft") next = index === 0 ? last : index - 1;
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = last;

  if (next === null) return;
  // Stop the host page treating these as page-level shortcuts.
  e.preventDefault();
  e.stopPropagation();
  select(tab.group, next, true);
}
