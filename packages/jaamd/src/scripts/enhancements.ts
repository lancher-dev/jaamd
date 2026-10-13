import { addHeadingLinks } from "./modules/heading-links.js";
import { addCopyButtons, onCopyClick } from "./modules/copy-buttons.js";
import { addImageLightbox, onLightboxClick } from "./modules/lightbox.js";
import { wrapTables } from "./modules/tables.js";
import { initCodeTabs, onTabClick, onTabKeydown } from "./modules/code-tabs.js";
import { initSpoilers, onSpoilerClick, onSpoilerKeydown } from "./modules/spoilers.js";
import { initToc } from "./modules/toc.js";
import { DEFAULT_SELECTOR } from "./utils.js";

// Bound once on `document`: survives View Transitions swaps and re-inits.
let eventsBound = false;

function bindEvents(): void {
  if (eventsBound) return;
  eventsBound = true;

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    onCopyClick(e.target);
    onTabClick(e.target);
    onSpoilerClick(e.target);
    onLightboxClick(e.target, e);
  });

  document.addEventListener("keydown", (e) => {
    if (!(e.target instanceof Element)) return;
    onTabKeydown(e.target, e);
    onSpoilerKeydown(e.target, e);
  });
}

export function initMarkdownEnhancements(
  selector: string = DEFAULT_SELECTOR,
): void {
  addHeadingLinks(selector);
  // After addHeadingLinks: the ids must exist.
  initToc(selector);
  addCopyButtons(selector);
  addImageLightbox(selector);
  wrapTables(selector);
  initCodeTabs(selector);
  initSpoilers(selector);
  bindEvents();
}
