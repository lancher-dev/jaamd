This page is rendered with JAAMD, and exercises every component it ships. What
you see below is the integration's own output.

:::toc[Components]
- [Installation](#installation)
- [Themes](#themes)
- [Table of contents](#table-of-contents)
- [Alerts](#alerts)
- [Code tabs](#code-tabs)
- [Copy buttons](#copy-buttons)
- [Heading links](#heading-links)
- [Image lightbox](#image-lightbox)
- [Details](#details)
- [Spoilers](#spoilers)
- [Tables](#tables)
- [Typography scale](#typography-scale)
  - [Third level](#third-level)
  - [Fourth level](#fourth-level)
  - [Fifth level](#fifth-level)
  - [Sixth level](#sixth-level)
:::

---

## Installation

```bash
npx astro add @lancher-dev/jaamd
```

Then wrap your content, and everything below this line is what you get.

```astro
---
import MarkdownContent from "@lancher-dev/jaamd/components";
---
<MarkdownContent>
  <slot />
</MarkdownContent>
```

---

## Themes

The picker in the header switches between JAAMD's own palette, which follows your
system, and the presets the package ships. The whole page follows, syntax colours
included: Shiki bakes one variable per theme at build time and the switch is pure
CSS.

```css
@import "@lancher-dev/jaamd/default.css";
@import "@lancher-dev/jaamd/themes/nord.css";
```

A theme declares nine seed colours and everything else derives from them. Adding
one is a directory and a manifest entry.

---

## Table of contents

The block above is markdown you write yourself: nothing is generated, so the
entries, their order and their depth are yours. The label becomes the title, and
the entry whose section is on screen is marked as current.

```markdown
:::toc[Components]
- [Alerts](#alerts)
- [Code tabs](#code-tabs)
  - [Nested entries work too](#nested-entries-work-too)
:::
```

Anchors come from Astro's heading ids, slugged with `github-slugger`: one dash
per space, punctuation dropped, underscores kept.

---

## Alerts

> [!NOTE]
> This is a note alert.

> [!WARNING]
> This is a warning alert.

> [!IMPORTANT]
> This is an important alert.

> [!TIP]
> This is a tip alert.

> [!CAUTION]
> This is a caution alert.

---

## Code tabs

Several code blocks in one tabbed panel. The text after the language is the tab
label; arrows move between tabs, and each panel is focusable so wide samples can
be scrolled by keyboard.

:::code-tabs
```js JavaScript
console.log("Hello from JavaScript!");
```
```ts TypeScript
const msg: string = "Hello from TypeScript!";
console.log(msg);
```
```py Python
print("Hello from Python!")
```
:::

---

## Copy buttons

Every fenced block gets one, top right on hover.

```ts
export function hello(name: string): string {
  return `Hello, ${name}!`;
}
```

---

## Heading links

Hover any heading on this page to reveal the anchor icon. Click it to copy that
section's URL. All six levels have one, and an anchored heading comes to rest
clear of the sticky header above.

---

## Image lightbox

Click the image to open it full screen. Press **Esc**, click the backdrop or the
✕ button to close.

![Astro logo](https://astro.build/assets/press/astro-logo-light-gradient.svg)

---

## Details

<details>
<summary>Click to expand</summary>

The height is animated on open and close. Any markdown goes inside, lists and
code included.

```js
console.log("Inside an accordion!");
```

</details>

<details open>
<summary>This one starts open</summary>

And it animates on the way out too.

</details>

---

## Spoilers

Click the blurred text, or focus it with <kbd>Tab</kbd> and press
<kbd>Enter</kbd>, to reveal it:

<span class="spoiler">The butler did it.</span>

---

## Tables

Wrapped in a scroll container, so a wide table never pushes the page sideways.

| Component        | Trigger                    | Notes                     |
|------------------|----------------------------|---------------------------|
| Table of contents| `:::toc`                   | Marks the entry in view   |
| Alerts           | `> [!NOTE]`                | Five variants             |
| Code tabs        | `:::code-tabs`             | Keyboard navigable        |
| Copy buttons     | any `pre`                  | Resets after 2 s          |
| Heading links    | `h1`–`h6`                  | Copies the section URL    |
| Image lightbox   | any `img`                  | Backdrop + Esc to close   |
| Details          | `<details>`                | Animated height           |
| Spoilers         | `class="spoiler"`          | Click or Enter to reveal  |

---

## Typography scale

Every construct that carries a `--jaamd-font-size-*` token, so the whole scale
can be checked at once. Set `--jaamd-font-size` on an unlayered `:root` and all
of this moves together; set one per-element token and only its own rows move.

### Third level

#### Fourth level

##### Fifth level

###### Sixth level

A paragraph, for the baseline size, with some `inline code` in it and a
[link](https://example.com) for good measure.

- A tight list item
- Another one, with `code` inside it
  - And a nested one

1. A tight ordered item
2. Followed by a loose list, whose items are wrapped in paragraphs:

- Loose items are `<li><p>…</p></li>`, so they read the paragraph token
  rather than the list one.

- Tight items carry no `<p>`, so they read the list token instead.

> A blockquote's first paragraph.
>
> And a second one. Both follow the blockquote's own size, not the paragraph
> token: the block that owns a token governs what is inside it.

Footnotes sit in their own block with their own size,[^1] paragraphs and list
items included.[^2]

[^1]: The first note.

[^2]: The second one, with `code` in it.
