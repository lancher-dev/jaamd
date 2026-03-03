import type { HTMLTag, Polymorphic } from "astro/types";

export type Props<Tag extends HTMLTag = "div"> = Polymorphic<{
  as: Tag;
  /**
   * Extra CSS classes to append to the wrapper element.
   * The `jaamd-content` class is always present — it is the selector used
   * by the JS enhancements and must not be removed.
   *
   * @example
   * // Renders: <article class="jaamd-content prose">
   * <MarkdownContent as="article" class="prose">
   */
  class?: string;
}>;

declare const MarkdownContent: <Tag extends HTMLTag = "div">(_props: Props<Tag>) => any;
export default MarkdownContent;
