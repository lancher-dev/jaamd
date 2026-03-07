import { qs, qsa, slugify } from "../utils.js";

// ─── Heading anchor links ─────────────────────────────────────────────────────

export function addHeadingLinks(selector: string): void {
  qsa<HTMLElement>(document, `${selector} h1, ${selector} h2, ${selector} h3`).forEach(
    (header) => {
      if (!header.id) header.id = slugify(header.textContent ?? "");
      if (qs(header, ".jaamd-heading-link")) return;

      const a = document.createElement("a");
      a.className = "jaamd-heading-link";
      a.setAttribute("aria-label", `Link to section: ${header.textContent}`);
      a.setAttribute("href", `#${header.id}`);
      a.title = "Copy link";
      a.innerHTML =
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ` +
        `stroke="currentColor" stroke-width="2" stroke-linecap="round" ` +
        `stroke-linejoin="round" width="1em" height="1em" aria-hidden="true">` +
        `<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>` +
        `<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>` +
        `</svg>`;

      a.addEventListener("click", async (e) => {
        e.preventDefault();
        const url = `${location.origin}${location.pathname}#${header.id}`;
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // clipboard not available (e.g. non-secure context) — fail silently
        }
      });

      header.appendChild(a);
    },
  );
}
