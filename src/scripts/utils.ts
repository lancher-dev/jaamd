// ─── Shared DOM utilities ─────────────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
