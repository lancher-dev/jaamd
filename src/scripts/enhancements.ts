import { addHeadingLinks } from "./modules/heading-links.js";
import { addCopyButtons } from "./modules/copy-buttons.js";
import { addImageLightbox } from "./modules/lightbox.js";
import { wrapTables } from "./modules/tables.js";
import { initCodeTabs } from "./modules/code-tabs.js";
import { initSpoilers } from "./modules/spoilers.js";
import { initDetails } from "./modules/details.js";
import { DEFAULT_SELECTOR } from "./utils.js";

export function initMarkdownEnhancements(
  selector: string = DEFAULT_SELECTOR,
): void {
  addHeadingLinks(selector);
  addCopyButtons(selector);
  addImageLightbox(selector);
  wrapTables(selector);
  initCodeTabs(selector);
  initSpoilers(selector);
  initDetails(selector);
}