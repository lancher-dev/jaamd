import { fileURLToPath } from "node:url";

/** Injected scripts resolve from the consumer's project, where a bare
 *  "@lancher-dev/jaamd/…" specifier is unreachable when jaamd is a transitive
 *  dependency. */
const own = (relative: string): string =>
  JSON.stringify(fileURLToPath(new URL(relative, import.meta.url)));

export const paths = {
  variables: own("./styles/variables.css"),
  shikiDual: own("./styles/shiki-dual.css"),
  markdown: own("./styles/markdown.css"),
  client: own("./scripts/enhancements.ts"),
};
