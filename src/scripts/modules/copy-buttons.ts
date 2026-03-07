import { qs, qsa } from "../utils.js";

// ─── Code copy buttons ────────────────────────────────────────────────────────

export function addCopyButtons(selector: string): void {
  qsa<HTMLElement>(document, `${selector} pre`).forEach((pre) => {
    if (qs(pre, ".jaamd-copy-btn")) return;
    const code = qs<HTMLElement>(pre, "code");
    if (!code) return;

    const btn = document.createElement("button");
    btn.className = "jaamd-copy-btn";
    btn.title = "Copy code";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.innerHTML = iconCopy();

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent ?? "");
        const orig = btn.innerHTML;
        btn.innerHTML = iconCheck();
        btn.style.color = "var(--jaamd-color-success, #22c55e)";
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.color = "";
        }, 2000);
      } catch {
        // fail silently
      }
    });

    pre.appendChild(btn);
  });
}

function iconCopy(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`;
}

function iconCheck(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
}
