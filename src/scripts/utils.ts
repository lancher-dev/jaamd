// ─── Shared DOM utilities ─────────────────────────────────────────────────────

/**
 * Slugify heading text for use as an element id.
 *
 * Keeps any Unicode letter or number, so CJK, Cyrillic, Arabic and accented
 * Latin headings survive instead of collapsing to an empty string under an
 * ASCII-only `\w` filter.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Appends `-1`, `-2`, ... until the id is free, so repeated headings never
 *  share an anchor. */
export function uniqueElementId(base: string): string {
  const seed = base || "section";
  if (!document.getElementById(seed)) return seed;

  let n = 1;
  while (document.getElementById(`${seed}-${n}`)) n++;
  return `${seed}-${n}`;
}

export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function qs<T extends Element = Element>(
  root: ParentNode,
  sel: string,
): T | null {
  return root.querySelector<T>(sel);
}

export function qsa<T extends Element = Element>(
  root: ParentNode,
  sel: string,
): NodeListOf<T> {
  return root.querySelectorAll<T>(sel);
}
