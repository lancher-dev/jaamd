import {
  HEADING_LINK_CLASS,
  HEADING_LINK_ICON,
  headingLinkLabel,
  qs,
  qsa,
  slugify,
  uniqueElementId,
} from "../utils.js";

/** Fallback for markup that skipped the build-time plugin. */
export function addHeadingLinks(selector: string): void {
  // All six levels: a TOC can link an h5.
  const levels = [1, 2, 3, 4, 5, 6].map((n) => `${selector} h${n}`).join(", ");

  qsa<HTMLElement>(document, levels).forEach((header) => {
    if (!header.id) header.id = uniqueElementId(slugify(header.textContent ?? ""));
    if (qs(header, `.${HEADING_LINK_CLASS}`)) return;

    const a = document.createElement("a");
    a.className = HEADING_LINK_CLASS;
    a.setAttribute("aria-label", headingLinkLabel(header.textContent ?? ""));
    a.setAttribute("href", `#${header.id}`);
    a.innerHTML = HEADING_LINK_ICON;

    header.appendChild(a);
  });
}
