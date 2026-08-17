---
layout: ../layouts/Layout.astro
title: JAAMD Feature Demo
---

# Feature Demo

This page exercises every client-side enhancement provided by jaamd.

---

## Heading anchor links

Hover any heading above to reveal the copy-link icon. Click it to copy the
section URL to the clipboard.

---

## Code copy button

```ts
export function hello(name: string): string {
  return `Hello, ${name}!`;
}
```

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

## Image lightbox

Click on the image below to open the lightbox. Press **Esc** or click the
backdrop / ✕ button to close it.

![Astro logo](https://astro.build/assets/press/astro-logo-light-gradient.svg)

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

## Details / accordion

<details>
<summary>Click to expand</summary>

This content is revealed with a smooth height animation. You can put **any
markdown** inside, including lists, code, and nested details.

```js
console.log("Inside an accordion!");
```

</details>

<details open>
<summary>This one starts open</summary>

And it also animates when you close it.

</details>

---

## Spoiler

Click the blurred text, or focus it with <kbd>Tab</kbd> and press
<kbd>Enter</kbd>, to reveal it:

<span class="spoiler">The butler did it.</span>

---

## Table

| Feature          | Status  | Notes                         |
|------------------|---------|-------------------------------|
| Heading links    | ✅ Done  | Copies URL to clipboard       |
| Copy buttons     | ✅ Done  | Resets after 2 s              |
| Image lightbox   | ✅ Done  | Backdrop + Esc to close       |
| Code tabs        | ✅ Done  | `:::code-tabs` directive      |
| Alerts           | ✅ Done  | GitHub-style `> [!NOTE]`      |
| Details animate  | ✅ Done  | Smooth height transition      |
| Spoilers         | ✅ Done  | Click to reveal               |

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

- That difference is the point of having both.

> A blockquote's first paragraph.
>
> And a second one. Both follow the blockquote's own size, not the paragraph
> token — the block that owns a token governs what is inside it.

Footnotes sit in their own block with their own size,[^1] paragraphs and list
items included.[^2]

[^1]: The first note.

[^2]: The second one, with `code` in it.
