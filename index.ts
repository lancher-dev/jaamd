import * as astroMarkdownRemark from "@astrojs/markdown-remark";
import type { AstroIntegration } from "astro";
import remarkDirective from "remark-directive";
import { remarkAlert } from "./src/plugins/remark-alert.js";
import remarkCodeTabs from "./src/plugins/remark-code-tabs.js";
import { paths } from "./src/paths.js";
import { DEFAULT_SELECTOR } from "./src/scripts/utils.js";

interface MarkdownProcessor {
  name: string;
  options: { remarkPlugins?: unknown[]; rehypePlugins?: unknown[]; remarkRehype?: unknown };
}

// `@astrojs/markdown-remark`'s `.d.ts` doesn't declare these yet, though the runtime exports them.
const { unified, isUnifiedProcessor } = astroMarkdownRemark as unknown as {
  unified: (opts?: { remarkPlugins?: unknown[]; rehypePlugins?: unknown[]; remarkRehype?: unknown }) => MarkdownProcessor;
  isUnifiedProcessor: (p: unknown) => boolean;
};

interface ShikiConfig {
  theme?: string;
  themes?: { light: string; dark: string };
  defaultColor?: string | false;
  wrap?: boolean;
}

interface MarkdownConfig {
  processor?: MarkdownProcessor;
  shikiConfig?: ShikiConfig;
}

export interface JaamdOptions {
  /**
   * CSS selector for the markdown content wrapper.
   * Must match the class on <MarkdownContent> (or your custom wrapper).
   * @default ".jaamd-content"
   */
  selector?: string;

  /**
   * Shiki theme. `{ light, dark }` enables dual-theme mode, which switches on a
   * `.dark` class on `<html>`.
   * @default "github-light"
   */
  theme?: string | { light: string; dark: string };

  /**
   * Skip injecting the default CSS variable fallbacks (`@lancher-dev/jaamd/default`).
   *
   * Has no effect when rendering through `<MarkdownContent>`, which imports
   * them statically; it applies to custom wrappers.
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

/** Registers jaamd's remark plugins and injects its stylesheets. */
export default function jaamd(options: JaamdOptions = {}): AstroIntegration {
  const {
    selector  = DEFAULT_SELECTOR,
    theme     = "github-light",
    noDefault = false,
    plugins   = {},
  } = options;
  const { codeTabs = true, alerts = true, directive = true } = plugins;

  return {
    name: "@lancher-dev/jaamd",
    hooks: {
      "astro:config:setup": ({ config, updateConfig, injectScript, logger }) => {
        const jaamdRemarkPlugins: unknown[] = [];
        if (alerts) jaamdRemarkPlugins.push(remarkAlert);
        // directive must come before codeTabs
        if (directive || codeTabs) jaamdRemarkPlugins.push(remarkDirective);
        if (codeTabs) jaamdRemarkPlugins.push(remarkCodeTabs);

        // Astro types both of these more precisely than jaamd needs; narrow them
        // once here to the handful of keys the integration actually touches.
        const mergedShikiConfig = {
          ...config.markdown?.shikiConfig,
        } as unknown as ShikiConfig;
        const currentProcessor = config.markdown?.processor as
          | MarkdownProcessor
          | undefined;

        const isDualTheme = typeof theme === "object" && !!theme.light && !!theme.dark;

        // Dual-theme mode: { light, dark } → Shiki "themes" with CSS variables
        if (isDualTheme) {
          delete mergedShikiConfig.theme;
          mergedShikiConfig.themes = { light: theme.light, dark: theme.dark };
          mergedShikiConfig.defaultColor = false;
        } else {
          mergedShikiConfig.theme = typeof theme === "string" ? theme : "github-light";
        }

        if (mergedShikiConfig.wrap === undefined) mergedShikiConfig.wrap = true;

        const markdownUpdate: MarkdownConfig = { shikiConfig: mergedShikiConfig };

        // Not public API. If Astro renames it, jaamd silently skips its plugins;
        // the scheduled CI run against latest Astro is what catches that.
        const ASTRO_DEFAULT_PROCESSOR = "satteri";

        const isUnified = !!currentProcessor && isUnifiedProcessor(currentProcessor);
        const isDefault =
          !currentProcessor || currentProcessor.name === ASTRO_DEFAULT_PROCESSOR;

        if (!isDefault && !isUnified) {
          logger.warn(
            `a custom \`markdown.processor\` ("${currentProcessor.name}") is already configured; jaamd's remark plugins (alerts/code-tabs) were not added. Pass them to your processor manually.`,
          );
        } else {
          const target = isUnified ? currentProcessor : unified();
          const existing: unknown[] = target.options.remarkPlugins ?? [];

          // Registering a plugin twice re-registers its micromark extensions.
          const nameOf = (p: unknown): string => {
            const fn = Array.isArray(p) ? p[0] : p;
            return typeof fn === "function" ? fn.name : "";
          };
          const existingNames = new Set(existing.map(nameOf).filter(Boolean));
          const missing = jaamdRemarkPlugins.filter(
            (p) => !existing.includes(p) && !existingNames.has(nameOf(p)),
          );

          // New array, not unshift: the processor may be shared between configs,
          // and mutating it stacks duplicates across setup runs.
          target.options.remarkPlugins = [...missing, ...existing];
          markdownUpdate.processor = target;

          logger.info(
            `markdown processor: ${currentProcessor?.name ?? "none"}, registered ${missing.length}/${jaamdRemarkPlugins.length} remark plugin(s)`,
          );
        }

        updateConfig({
          vite: {
            // Without this, jaamd's .astro sources are treated as pre-bundled
            // externals and never reach the Astro compiler.
            ssr: { noExternal: ["@lancher-dev/jaamd"] },
          },
          markdown: markdownUpdate,
        });

        // Stylesheets go through "page-ssr". CSS imported from the client "page"
        // stage is dropped by Rollup in static builds.
        injectScript(
          "page-ssr",
          [
            ...(noDefault ? [] : [`import ${paths.variables};`]),
            ...(isDualTheme ? [`import ${paths.shikiDual};`] : []),
            `import ${paths.markdown};`,
          ].join("\n"),
        );

        injectScript(
          "page",
          [
            `import { initMarkdownEnhancements } from ${paths.client};`,
            `function __jaamdRun() { initMarkdownEnhancements(${JSON.stringify(selector)}); }`,
            `__jaamdRun();`,
            `document.addEventListener("astro:page-load", __jaamdRun);`,
          ].join("\n"),
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