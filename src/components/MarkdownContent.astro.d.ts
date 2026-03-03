import type { HTMLAttributes } from "astro/types";

export interface Props extends HTMLAttributes<"div"> {
  /**
   * Extra CSS classes to append to the wrapper div.
   * The `jaamd-content` class is always present — it is the selector used
   * by the JS enhancements and must not be removed.
   *
   * @example
   * // Renders: <div class="jaamd-content prose mx-auto">
   * <MarkdownContent class="prose mx-auto">
   */
  class?: string;
}

declare const MarkdownContent: (_props: Props) => any;
export default MarkdownContent;
