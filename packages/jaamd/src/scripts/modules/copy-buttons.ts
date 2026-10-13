import { qs, qsa } from "../utils.js";

const BUTTON_CLASS = "jaamd-copy-btn";
const LIVE_ID = "jaamd-live";
const RESET_MS = 2000;

const LABEL = "Copy code to clipboard";

const resetTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

export function addCopyButtons(selector: string): void {
  qsa<HTMLElement>(document, `${selector} pre`).forEach((pre) => {
    if (qs(pre, `.${BUTTON_CLASS}`)) return;
    if (!qs(pre, "code")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = BUTTON_CLASS;
    btn.title = "Copy code";
    btn.setAttribute("aria-label", LABEL);
    // Both icons: `data-copied` picks one in CSS.
    btn.innerHTML = ICON_COPY + ICON_CHECK;

    pre.appendChild(btn);
  });
}

/** The only clipboard write in the package. */
export async function onCopyClick(target: Element): Promise<void> {
  const btn = target.closest<HTMLElement>(`.${BUTTON_CLASS}`);
  const code = btn?.parentElement && qs<HTMLElement>(btn.parentElement, "code");
  if (!btn || !code) return;

  let copied = true;
  try {
    await navigator.clipboard.writeText(code.textContent ?? "");
  } catch {
    // No clipboard (non-secure context, denied, blocked): select the code.
    copied = false;
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  btn.dataset.copied = copied ? "true" : "manual";
  announce(
    copied
      ? "Code copied to clipboard"
      : "Code selected: copy it with your keyboard",
  );

  // Restart on every click.
  clearTimeout(resetTimers.get(btn));
  resetTimers.set(
    btn,
    setTimeout(() => delete btn.dataset.copied, RESET_MS),
  );
}

/** One polite live region. Looked up each time: View Transitions swap <body>. */
function announce(message: string): void {
  let live = document.getElementById(LIVE_ID);
  if (!live) {
    live = document.createElement("div");
    live.id = LIVE_ID;
    live.className = LIVE_ID;
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    document.body.appendChild(live);
  }
  // Cleared first, so the same message is announced again.
  live.textContent = "";
  requestAnimationFrame(() => (live.textContent = message));
}

const SVG_ATTRS = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true"`;

const ICON_COPY = `<svg class="jaamd-copy-icon" ${SVG_ATTRS}><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;

const ICON_CHECK = `<svg class="jaamd-copied-icon" ${SVG_ATTRS}><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
