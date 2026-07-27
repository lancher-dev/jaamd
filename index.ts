import * as astroMarkdownRemark from "@astrojs/markdown-remark";
import type { AstroIntegration } from "astro";
import remarkDirective from "remark-directive";
import { remarkAlert } from "./src/plugins/remark-alert.js";
import remarkCodeTabs from "./src/plugins/remark-code-tabs.js";

// `@astrojs/markdown-remark`'s `.d.ts` doesn't declare these yet, though the runtime exports them.
const { unified, isUnifiedProcessor } = astroMarkdownRemark as unknown as {
  unified: (opts?: { remarkPlugins?: unknown[]; rehypePlugins?: unknown[]; remarkRehype?: unknown }) => {
    name: string;
    options: { remarkPlugins: unknown[]; rehypePlugins: unknown[]; remarkRehype: unknown };
  };
  isUnifiedProcessor: (p: unknown) => boolean;
};

export interface JaamdOptions {
  /**
   * CSS selector for the markdown content wrapper.
   * Must match the class on <MarkdownContent> (or your custom wrapper).
   * @default ".jaamd-content"
   */
  selector?: string;

  /**
   * Shiki syntax-highlighting theme.
   *
   * - **string** — single theme name (e.g. `"github-light"`).
   * - **{ light, dark }** — enables dual-theme mode. Shiki outputs CSS
   *   variables for both themes and JAAMD injects the switching CSS.
   *   Use together with a `.dark` class on `<html>` for dark-mode toggling.
   *
   * @default "github-light"
   */
  theme?: string | { light: string; dark: string };

  /**
   * Skip injecting the default CSS variable fallbacks (`jaamd/default`).
   *
   * `<MarkdownContent>` already imports `jaamd/default` (and the main
   * stylesheet) statically in its own frontmatter, so this option has no
   * effect for consumers using that component — the defaults are always
   * present there, extracted by Astro/Vite's normal CSS pipeline.
   *
   * This flag only affects the fallback copy injected via the client-side
   * "page" script, which exists for custom wrappers that render markdown
   * without `<MarkdownContent>`. Note that CSS side-effect imports inside
   * an injected script are not reliably retained by Rollup in a static
   * build (confirmed missing from production output in testing) — prefer
   * importing `jaamd/default` directly in your own wrapper rather than
   * relying on this option.
   * @default false
   */
  noDefault?: boolean;

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
  const {
    selector  = ".jaamd-content",
    theme     = "github-light",
    noDefault = false,
    plugins   = {},
  } = options;
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

        const existingMarkdown = (config.markdown as any) ?? {};
        const existingShikiConfig: any = existingMarkdown.shikiConfig ?? {};

        // `wrap` and other keys are only filled in when absent.
        const mergedShikiConfig: any = { ...existingShikiConfig };

        // Dual-theme mode: { light, dark } → Shiki "themes" with CSS variables
        if (typeof theme === "object" && theme.light && theme.dark) {
          delete mergedShikiConfig.theme;
          mergedShikiConfig.themes = { light: theme.light, dark: theme.dark };
          mergedShikiConfig.defaultColor = false;
        } else {
          mergedShikiConfig.theme = typeof theme === "string" ? theme : "github-light";
        }

        if (mergedShikiConfig.wrap === undefined) mergedShikiConfig.wrap = true;

        const markdownUpdate: Record<string, any> = { shikiConfig: mergedShikiConfig };

        // Default processor arrives pre-filled as "satteri" here — that's
        // the no-override case, so it's still safe to replace.
        const currentProcessor = existingMarkdown.processor;
        const isDefaultOrUnified =
          !currentProcessor || currentProcessor.name === "satteri" || isUnifiedProcessor(currentProcessor);
        if (!isDefaultOrUnified) {
          logger.warn(
            `a custom \`markdown.processor\` ("${currentProcessor.name}") is already configured; jaamd's remark plugins (alerts/code-tabs) were not added. Pass them to your processor manually.`,
          );
        } else {
          const target = isUnifiedProcessor(currentProcessor) ? currentProcessor : unified();
          target.options.remarkPlugins.unshift(...jaamdRemarkPlugins);
          markdownUpdate.processor = target;
        }

        updateConfig({
          vite: {
            ssr: {
              // Ensure jaamd source files (including .astro components) are
              // processed by Vite transforms (i.e. the Astro compiler) rather
              // than being treated as pre-bundled external modules.
              noExternal: ["jaamd"],
            },
          },
          markdown: markdownUpdate,
        });

        // "page" stage: bundled by Vite, tree-shaken, no duplicate injection
        const isDualTheme = typeof theme === "object" && theme.light && theme.dark;
        injectScript(
          "page",
          (!noDefault ? `import "jaamd/default";
` : "") +
          (isDualTheme ? `import "jaamd/shiki-dual";
` : "") +
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