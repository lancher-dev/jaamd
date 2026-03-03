/**
 * jaamd client-side enhancements
 *
 * Plain ES module — bundled by Vite as part of the Astro build.
 * No external runtime dependencies.
 */

// ─── Utilities ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function qs<T extends Element = Element>(
  root: ParentNode,
  sel: string,
): T | null {
  return root.querySelector<T>(sel);
}

function qsa<T extends Element = Element>(
  root: ParentNode,
  sel: string,
): NodeListOf<T> {
  return root.querySelectorAll<T>(sel);
}

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

// ─── Heading anchor links ─────────────────────────────────────────────────────

function addHeadingLinks(selector: string): void {
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

// ─── Code copy buttons ────────────────────────────────────────────────────────

function addCopyButtons(selector: string): void {
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

// ─── Image lightbox ───────────────────────────────────────────────────────────

function addImageLightbox(selector: string): void {
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

// ─── Responsive table wrapper ─────────────────────────────────────────────────

function wrapTables(selector: string): void {
  qsa<HTMLTableElement>(document, `${selector} table`).forEach((table) => {
    if (table.parentElement?.classList.contains("jaamd-table-wrapper")) return;
    const wrapper = document.createElement("div");
    wrapper.className = "jaamd-table-wrapper";
    table.parentNode!.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

// ─── Code tabs ────────────────────────────────────────────────────────────────

function initCodeTabs(): void {
  qsa<HTMLElement>(document, ".code-tabs").forEach((group) => {
    if (group.dataset.tabsInit) return;
    group.dataset.tabsInit = "1";

    qsa<HTMLButtonElement>(group, ".code-tab-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = btn.dataset.tabIndex;
        qsa(group, ".code-tab-btn").forEach((b) =>
          b.classList.remove("active"),
        );
        qsa(group, ".code-tab-panel").forEach((p) =>
          p.classList.remove("active"),
        );
        btn.classList.add("active");
        qs(group, `.code-tab-panel[data-tab-index="${idx}"]`)?.classList.add(
          "active",
        );
      });
    });
  });
}

// ─── Spoilers ─────────────────────────────────────────────────────────────────

function initSpoilers(selector: string): void {
  qsa<HTMLElement>(document, `${selector} .spoiler`).forEach((el) => {
    if (el.dataset.spoilerInit) return;
    el.dataset.spoilerInit = "1";
    el.addEventListener("click", () => el.classList.toggle("revealed"));
  });
}

// ─── Details / Summary animation ─────────────────────────────────────────────

function initDetails(selector: string): void {
  qsa<HTMLDetailsElement>(document, `${selector} details`).forEach(
    (details) => {
      if (details.dataset.detailsInit) return;
      details.dataset.detailsInit = "1";

      const summary = qs<HTMLElement>(details, "summary");
      if (!summary) return;

      // Two-level wrap:
      //   wrapper — animates height only
      //   inner   — holds padding so it's baked into scrollHeight (no jump)
      const wrapper = document.createElement("div");
      wrapper.className = "jaamd-details-wrapper";
      const inner = document.createElement("div");
      inner.className = "jaamd-details-inner";

      Array.from(details.childNodes).forEach((node) => {
        if (node !== summary) inner.appendChild(node);
      });
      wrapper.appendChild(inner);
      details.appendChild(wrapper);

      if (!details.open) {
        wrapper.style.height = "0px";
        wrapper.style.overflow = "hidden";
      }

      summary.addEventListener("click", (e) => {
        e.preventDefault();

        if (details.open) {
          // closing
          const startH = wrapper.scrollHeight;
          wrapper.style.overflow = "hidden";
          const anim = wrapper.animate(
            [{ height: `${startH}px` }, { height: "0px" }],
            { duration: 280, easing: "ease" },
          );
          anim.onfinish = () => {
            wrapper.style.height = "0px";
            details.removeAttribute("open");
          };
        } else {
          // opening
          details.setAttribute("open", "");
          const endH = wrapper.scrollHeight;
          wrapper.style.overflow = "hidden";
          const anim = wrapper.animate(
            [{ height: "0px" }, { height: `${endH}px` }],
            { duration: 280, easing: "ease" },
          );
          anim.onfinish = () => {
            wrapper.style.height = "auto";
            wrapper.style.overflow = "";
          };
        }
      });
    },
  );
}