import { qsa } from "../utils.js";

/** Previous run's observers: re-init must not stack them. */
const observers = new WeakMap<HTMLElement, IntersectionObserver>();

/** `link.hash` is percent-encoded; a malformed escape is used verbatim. */
function decodeId(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function scrollMarginTop(nav: HTMLElement): number {
  const raw = getComputedStyle(nav)
    .getPropertyValue("--jaamd-scroll-margin-top")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 80;
}

/** Marks the entry whose section is in view. The links stay plain anchors. */
export function initToc(selector: string): void {
  qsa<HTMLElement>(document, `${selector} .jaamd-toc`).forEach((nav) => {
    observers.get(nav)?.disconnect();

    const links = new Map<Element, HTMLAnchorElement>();

    qsa<HTMLAnchorElement>(nav, 'a[href*="#"]').forEach((link) => {
      const id = link.hash.slice(1);
      if (!id) return;

      // A hand-written anchor can be wrong: the link just never lights up.
      const target = document.getElementById(decodeId(id));
      if (target) links.set(target, link);
    });

    if (links.size === 0) return;

    const visible = new Set<Element>();
    const order = [...links.keys()];

    const setCurrent = (target: Element | null) => {
      links.forEach((link, key) => {
        if (key === target) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }

        // Several headings can share the band; the topmost one wins.
        const current = order.find((el) => visible.has(el)) ?? null;
        if (current) setCurrent(current);
      },
      {
        // Band from where an anchored heading rests down to 30% of the viewport.
        rootMargin: `-${scrollMarginTop(nav)}px 0px -70% 0px`,
      },
    );

    links.forEach((_link, target) => observer.observe(target));
    observers.set(nav, observer);
  });
}
