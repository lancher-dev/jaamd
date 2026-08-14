import { qs, qsa, prefersReducedMotion } from "../utils.js";

export function initDetails(selector: string): void {
  qsa<HTMLDetailsElement>(document, `${selector} details`).forEach(
    (details) => {
      if (details.dataset.detailsInit) return;
      details.dataset.detailsInit = "1";

      const summary = qs<HTMLElement>(details, "summary");
      if (!summary) return;

      // Two-level wrap:
      //   wrapper — animates height only
      //   inner   — holds padding so it's baked into scrollHeight (no jump)
      const wrapper = document.createElement("div");
      wrapper.className = "jaamd-details-wrapper";
      const inner = document.createElement("div");
      inner.className = "jaamd-details-inner";

      Array.from(details.childNodes).forEach((node) => {
        if (node !== summary) inner.appendChild(node);
      });
      wrapper.appendChild(inner);
      details.appendChild(wrapper);

      if (!details.open) {
        wrapper.style.height = "0px";
        wrapper.style.overflow = "hidden";
      }

      // A second click mid-animation would animate from a half-collapsed height.
      let animating = false;

      summary.addEventListener("click", (e) => {
        e.preventDefault();
        if (animating) return;

        const closing = details.open;
        if (!closing) details.setAttribute("open", "");

        const height = `${wrapper.scrollHeight}px`;
        const frames = closing
          ? [{ height }, { height: "0px" }]
          : [{ height: "0px" }, { height }];

        wrapper.style.overflow = "hidden";
        animating = true;

        const anim = wrapper.animate(frames, {
          duration: prefersReducedMotion() ? 0 : 280,
          easing: "ease",
        });

        // `finished` settles on cancel too. With `onfinish` alone, an animation
        // cancelled mid-flight — a View Transition swapping the node out, say —
        // would leave `animating` true and wedge the toggle for good.
        anim.finished
          .catch(() => {})
          .then(() => {
            if (closing) {
              wrapper.style.height = "0px";
              details.removeAttribute("open");
            } else {
              wrapper.style.height = "auto";
              wrapper.style.overflow = "";
            }
            animating = false;
          });
      });
    },
  );
}
