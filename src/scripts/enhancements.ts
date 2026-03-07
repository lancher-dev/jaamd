/**
 * jaamd client-side enhancements
 *
 * Plain ES module — bundled by Vite as part of the Astro build.
 * No external runtime dependencies.
 *
 * Each feature lives in its own module; this file is the public entry point
 * that wires them all together via `initMarkdownEnhancements`.
 */

import { addHeadingLinks } from "./modules/heading-links.js";
import { addCopyButtons } from "./modules/copy-buttons.js";
import { addImageLightbox } from "./modules/lightbox.js";
import { wrapTables } from "./modules/tables.js";
import { initCodeTabs } from "./modules/code-tabs.js";
import { initSpoilers } from "./modules/spoilers.js";
import { initDetails } from "./modules/details.js";

// ─── Public API ───────────────────────────────────────────────────────────────

export function initMarkdownEnhancements(
  selector: string = ".jaamd-content",
): void {
  addHeadingLinks(selector);
  addCopyButtons(selector);
  addImageLightbox(selector);
  wrapTables(selector);
  initCodeTabs();
  initSpoilers(selector);
  initDetails(selector);
}