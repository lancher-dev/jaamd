/** Wrapper class the integration and the client enhancements agree on. */
export const DEFAULT_SELECTOR = ".jaamd-content";

/**
 * `github-slugger`'s algorithm, matching the ids Astro's rehypeHeadingIds emits.
 * Reimplemented, not imported: ~10 kB against ~2 kB gzipped for the whole client.
 *
 * `-` and `_` survive, only the literal space becomes a dash ("a / b" → "a--b"),
 * nothing is trimmed. Property escapes, not `\w`, which drops CJK and Cyrillic.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/(?![-_])[\p{P}\p{S}\p{C}]/gu, "")
    .replace(/ /g, "-");
}

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
