import { qs, qsa } from "../utils.js";

// ─── Image lightbox ───────────────────────────────────────────────────────────

export function addImageLightbox(selector: string): void {
  qsa<HTMLImageElement>(document, `${selector} img`).forEach((img) => {
    if (img.classList.contains("jaamd-lightbox-enabled")) return;
    img.classList.add("jaamd-lightbox-enabled");
    img.style.cursor = "pointer";
    img.title = img.alt || "Click to enlarge";
    img.addEventListener("click", () => openLightbox(img.src, img.alt));
  });
}

function openLightbox(src: string, alt: string): void {
  let lb = document.getElementById("jaamd-lightbox");

  if (!lb) {
    lb = document.createElement("div");
    lb.id = "jaamd-lightbox";
    lb.className = "jaamd-lightbox jaamd-lightbox--hidden";
    lb.innerHTML =
      `<div class="jaamd-lightbox__backdrop"></div>` +
      `<div class="jaamd-lightbox__content">` +
      `<button class="jaamd-lightbox__close" aria-label="Close lightbox">` +
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden="true">` +
      `<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>` +
      `</button>` +
      `<img class="jaamd-lightbox__img" src="" alt="" />` +
      `</div>`;
    document.body.appendChild(lb);

    const close = (): void => {
      lb!.classList.add("jaamd-lightbox--hidden");
      document.body.style.overflow = "";
    };

    qs(lb, ".jaamd-lightbox__backdrop")!.addEventListener("click", close);
    qs(lb, ".jaamd-lightbox__close")!.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !lb!.classList.contains("jaamd-lightbox--hidden"))
        close();
    });
  }

  (qs<HTMLImageElement>(lb, ".jaamd-lightbox__img")!).src = src;
  (qs<HTMLImageElement>(lb, ".jaamd-lightbox__img")!).alt = alt ?? "";
  lb.classList.remove("jaamd-lightbox--hidden");
  document.body.style.overflow = "hidden";
}
