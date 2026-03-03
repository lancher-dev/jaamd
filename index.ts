import type { AstroIntegration } from "astro";
import remarkDirective from "remark-directive";
import { remarkAlert } from "./src/plugins/remark-alert.js";
import remarkCodeTabs from "./src/plugins/remark-code-tabs.js";

export interface JaamdOptions {
  /**
   * CSS selector for the markdown content wrapper.
   * Must match the class on <MarkdownContent> (or your custom wrapper).
   * @default ".jaamd-content"
   */
  selector?: string;

  /**
   * Granular control over which remark plugins are registered.
   * All enabled by default.
   */
  plugins?: {
    /** :::code-tabs directive — requires `directive: true` */
    codeTabs?: boolean;
    /** GitHub-style > [!NOTE] / [!WARNING] alerts */
    alerts?: boolean;
    /** remark-directive (prerequisite for codeTabs) */
    directive?: boolean;
  };
}

/**
 * jaamd — Just Another Astro Markdown
 *
 * Registers remark plugins and injects the stylesheet automatically.
 * Supports `astro add jaamd`.
 */
export default function jaamd(options: JaamdOptions = {}): AstroIntegration {
  const { selector = ".jaamd-content", plugins = {} } = options;
  const { codeTabs = true, alerts = true, directive = true } = plugins;

  return {
    name: "jaamd",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, injectScript, logger }) => {
        const jaamdRemarkPlugins: any[] = [];
        if (alerts) jaamdRemarkPlugins.push(remarkAlert);
        // directive must come before codeTabs
        if (directive || codeTabs) jaamdRemarkPlugins.push(remarkDirective);
        if (codeTabs) jaamdRemarkPlugins.push(remarkCodeTabs);

        // Read remark/rehype plugins already set in the user's defineConfig
        // and prepend jaamd's own plugins so they run first.
        const existingMarkdown = (config.markdown as any) ?? {};
        const existingRemarkPlugins: any[] = existingMarkdown.remarkPlugins ?? [];
        const existingShikiConfig: any = existingMarkdown.shikiConfig ?? {};

        // Apply sensible defaults for shikiConfig only when the user hasn't
        // already set those specific keys.
        const shikiDefaults: any = { theme: "github-dark", wrap: true };
        const mergedShikiConfig = { ...shikiDefaults, ...existingShikiConfig };

        updateConfig({
          vite: {
            ssr: {
              // Ensure jaamd source files (including .astro components) are
              // processed by Vite transforms (i.e. the Astro compiler) rather
              // than being treated as pre-bundled external modules.
              noExternal: ["jaamd"],
            },
          },
          markdown: {
            remarkPlugins: [...jaamdRemarkPlugins, ...existingRemarkPlugins],
            shikiConfig: mergedShikiConfig,
          },
        });

        // "page" stage: bundled by Vite, tree-shaken, no duplicate injection
        injectScript(
          "page",
          `import "jaamd/styles";
` +
          `import { initMarkdownEnhancements } from "jaamd/client";
` +
          `function __jaamdRun() { initMarkdownEnhancements(${JSON.stringify(selector)}); }
` +
          `__jaamdRun();
` +
          `document.addEventListener("astro:page-load", __jaamdRun);`,
        );

        logger.info("jaamd: markdown enhancements ready");
      },
    },
  };
}

// Named re-exports for users who configure remark manually
export { default as remarkCodeTabs } from "./src/plugins/remark-code-tabs.js";
export { remarkAlert } from "./src/plugins/remark-alert.js";
export { default as remarkDirective } from "remark-directive";

export type { JaamdOptions as Options };