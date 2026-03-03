import type { AstroIntegration } from "astro";
import { remarkAlert } from "remark-github-blockquote-alert";
import remarkDirective from "remark-directive";
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
      "astro:config:setup": ({ updateConfig, injectScript, logger }) => {
        const remarkPlugins: any[] = [];
        if (alerts) remarkPlugins.push(remarkAlert);
        // directive must come before codeTabs
        if (directive || codeTabs) remarkPlugins.push(remarkDirective);
        if (codeTabs) remarkPlugins.push(remarkCodeTabs);

        updateConfig({ markdown: { remarkPlugins } });

        // "page" stage: bundled by Vite, tree-shaken, no duplicate injection
        injectScript("page", `import "jaamd/styles";`);

        logger.info("jaamd: markdown enhancements ready");
      },
    },
  };
}

// Named re-exports for users who configure remark manually
export { default as remarkCodeTabs } from "./src/plugins/remark-code-tabs.js";
export { remarkAlert, remarkDirective };
export type { JaamdOptions as Options };