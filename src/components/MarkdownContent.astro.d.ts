import type { HTMLTag, Polymorphic } from "astro/types";

export type Props<Tag extends HTMLTag = "div"> = Polymorphic<{
  as: Tag;
  /** Appended to the always-present `jaamd-content` class, which the JS
   *  enhancements select on. */
  class?: string;
}>;

declare const MarkdownContent: <Tag extends HTMLTag = "div">(_props: Props<Tag>) => any;
export default MarkdownContent;
