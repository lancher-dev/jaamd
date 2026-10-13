import { qs, qsa } from "../utils.js";

const ENABLED = "jaamd-lightbox-enabled";
const DIALOG_ID = "jaamd-lightbox";

/** Opt out with `data-no-lightbox`. Linked images are skipped: a click on
 *  `[![alt](src)](href)` must follow the link. */
export function addImageLightbox(selector: string): void {
  qsa<HTMLImageElement>(document, `${selector} img`).forEach((img) => {
    if (img.classList.contains(ENABLED)) return;
    if (img.hasAttribute("data-no-lightbox")) return;
    if (img.closest("a")) return;

    img.classList.add(ENABLED);
    if (!img.title) img.title = img.alt || "Click to enlarge";
  });
}

/** Modal `<dialog>`: Escape, focus trap and focus return are the browser's. */
function buildLightbox(): HTMLDialogElement {
  const dialog = document.createElement("dialog");
  dialog.id = DIALOG_ID;
  dialog.className = "jaamd-lightbox";
  dialog.setAttribute("aria-label", "Image preview");
  dialog.innerHTML =
    `<button type="button" class="jaamd-lightbox__close" aria-label="Close image preview">` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">` +
    `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>` +
    `</button>` +
    `<img class="jaamd-lightbox__img" src="" alt="" />`;
  document.body.appendChild(dialog);
  return dialog;
}

export function onLightboxClick(target: Element, e: MouseEvent): void {
  const dialog = target.closest<HTMLDialogElement>(`#${DIALOG_ID}`);
  if (dialog) {
    // The dialog fills the viewport: a click on it is a click outside the image.
    if (target === dialog || target.closest(".jaamd-lightbox__close")) dialog.close();
    return;
  }

  const img = target.closest<HTMLImageElement>(`img.${ENABLED}`);
  if (!img) return;
  e.preventDefault();

  // Looked up each time: View Transitions swap <body>.
  const lightbox =
    (document.getElementById(DIALOG_ID) as HTMLDialogElement | null) ?? buildLightbox();
  const image = qs<HTMLImageElement>(lightbox, ".jaamd-lightbox__img")!;
  image.src = img.currentSrc || img.src;
  image.alt = img.alt;
  lightbox.showModal();
}
