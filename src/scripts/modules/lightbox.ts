import { qs, qsa } from "../utils.js";

// ─── Image lightbox ───────────────────────────────────────────────────────────

/** Opt out with `data-no-lightbox`. Linked images are skipped: a click on
 *  `[![alt](src)](href)` must follow the link. */
export function addImageLightbox(selector: string): void {
  qsa<HTMLImageElement>(document, `${selector} img`).forEach((img) => {
    if (img.classList.contains("jaamd-lightbox-enabled")) return;
    if (img.hasAttribute("data-no-lightbox")) return;
    if (img.closest("a")) return;

    img.classList.add("jaamd-lightbox-enabled");
    img.style.cursor = "pointer";
    if (!img.title) img.title = img.alt || "Click to enlarge";
    img.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(img.src, img.alt);
    });
  });
}

/** Restored on close, so an overflow set by the host page survives. */
let previousBodyOverflow = "";

function buildLightbox(): HTMLElement {
  const lb = document.createElement("div");
  lb.id = "jaamd-lightbox";
  lb.className = "jaamd-lightbox jaamd-lightbox--hidden";
  lb.innerHTML =
    `<div class="jaamd-lightbox__backdrop"></div>` +
    `<div class="jaamd-lightbox__content" role="dialog" aria-modal="true" aria-label="Image preview">` +
    `<button class="jaamd-lightbox__close" aria-label="Close lightbox">` +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">` +
    `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>` +
    `</button>` +
    `<img class="jaamd-lightbox__img" src="" alt="" />` +
    `</div>`;
  document.body.appendChild(lb);

  qs(lb, ".jaamd-lightbox__backdrop")!.addEventListener("click", closeLightbox);
  qs(lb, ".jaamd-lightbox__close")!.addEventListener("click", closeLightbox);

  return lb;
}

function closeLightbox(): void {
  const lb = document.getElementById("jaamd-lightbox");
  if (!lb) return;
  lb.classList.add("jaamd-lightbox--hidden");
  document.body.style.overflow = previousBodyOverflow;
}

// The overlay lives in <body>, which a View Transitions swap replaces. Binding
// Escape to the element would leak a listener and a detached node per
// navigation, so it is delegated to `document` and registered once.
let keydownBound = false;

function openLightbox(src: string, alt: string): void {
  const lb = document.getElementById("jaamd-lightbox") ?? buildLightbox();

  if (!keydownBound) {
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      const current = document.getElementById("jaamd-lightbox");
      if (current && !current.classList.contains("jaamd-lightbox--hidden"))
        closeLightbox();
    });
    keydownBound = true;
  }

  const image = qs<HTMLImageElement>(lb, ".jaamd-lightbox__img")!;
  image.src = src;
  image.alt = alt ?? "";

  previousBodyOverflow = document.body.style.overflow;
  lb.classList.remove("jaamd-lightbox--hidden");
  document.body.style.overflow = "hidden";

  qs<HTMLElement>(lb, ".jaamd-lightbox__close")?.focus();
}
