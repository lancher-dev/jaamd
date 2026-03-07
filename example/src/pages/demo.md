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

Hover or click the blurred text to reveal it:

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
