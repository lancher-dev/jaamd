import { qs, qsa } from "../utils.js";

// ─── Details / Summary animation ─────────────────────────────────────────────

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

      summary.addEventListener("click", (e) => {
        e.preventDefault();

        if (details.open) {
          // closing
          const startH = wrapper.scrollHeight;
          wrapper.style.overflow = "hidden";
          const anim = wrapper.animate(
            [{ height: `${startH}px` }, { height: "0px" }],
            { duration: 280, easing: "ease" },
          );
          anim.onfinish = () => {
            wrapper.style.height = "0px";
            details.removeAttribute("open");
          };
        } else {
          // opening
          details.setAttribute("open", "");
          const endH = wrapper.scrollHeight;
          wrapper.style.overflow = "hidden";
          const anim = wrapper.animate(
            [{ height: "0px" }, { height: `${endH}px` }],
            { duration: 280, easing: "ease" },
          );
          anim.onfinish = () => {
            wrapper.style.height = "auto";
            wrapper.style.overflow = "";
          };
        }
      });
    },
  );
}
